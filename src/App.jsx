import { useState, useRef } from 'react';
// toPng ถูก import ไว้เพื่อให้ bundler รู้จัก (ใช้ dynamic import ใน exportAsImage จริง)
import { toPng } from 'html-to-image';
import MemberInput from './components/MemberInput';
import ItemForm from './components/ItemForm';
import Receipt from './components/Receipt';
import PreviewModal from './components/PreviewModal';
import { calculateTotals, calculateGrandTotal } from './utils/calculations';
import { parseNames } from './utils/parsers';

/**
 * App หลัก — จัดการ state ทั้งหมดของแอป
 *
 * State ทั้งหมด:
 *  - people      : รายชื่อคนในบิล
 *  - items       : รายการสินค้าในบิล
 *  - qrCode      : data URL ของรูป QR code (ถ้ามี)
 *  - isExporting : กำลัง export รูปอยู่หรือไม่ (ใช้ disable ปุ่ม)
 *  - previewImage: blob URL ของรูปที่ export เสร็จแล้ว (ใช้แสดงใน PreviewModal)
 *
 * Refs:
 *  - receiptRef   : ref ไปยัง DOM ของ Receipt (ใช้ capture เป็นรูป)
 *  - fileInputRef : ref ไปยัง <input type="file"> สำหรับอัปโหลด QR
 */
export default function App() {
  // ============================================================
  // === State ===
  // ============================================================
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Refs สำหรับเข้าถึง DOM โดยตรง
  const receiptRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================
  // === Handlers (ฟังก์ชันจัดการ state/event) ===
  // ============================================================

  /**
   * อ่านไฟล์ QR code ที่ผู้ใช้เลือก แล้วแปลงเป็น data URL
   * เก็บไว้ใน state `qrCode` เพื่อนำไปแสดงในใบเสร็จ
   */
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCode(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /** ลบ QR code และ clear ค่าใน <input type="file"> */
  const removeQr = () => {
    setQrCode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * เพิ่มชื่อคนหลายๆ คน (คั่นด้วย space) เข้า list
   * ใช้ parseNames() จัดการ split/trim/filter/dedupe
   */
  const addNames = (input) => {
    const newNames = parseNames(input, people);
    if (newNames.length > 0) {
      setPeople([...people, ...newNames]);
    }
  };

  /** ลบคนออกจาก list */
  const removePerson = (nameToRemove) => {
    setPeople(people.filter((name) => name !== nameToRemove));
  };

  /**
   * เพิ่มรายการสินค้าใหม่
   * ใช้ Date.now() เป็น id แบบง่าย (เพียงพอสำหรับ use case นี้)
   */
  const addItem = (newItemData) => {
    const newItem = {
      id: Date.now(),
      ...newItemData,
    };
    setItems([...items, newItem]);
  };

  /** ลบรายการสินค้าตาม id */
  const removeItem = (idToRemove) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  // ============================================================
  // === Derived values (ค่าที่คำนวณจาก state) ===
  // ============================================================
  // คำนวณยอดรายคน + ยอดรวมทั้งหมด ใช้ utils (pure functions)
  const totals = calculateTotals(people, items);
  const grandTotal = calculateGrandTotal(items);

  // ============================================================
  // === Actions (ฟังก์ชันที่ต้อง async หรือ side-effect หนักๆ) ===
  // ============================================================

  /**
   * Export ใบเสร็จเป็นรูปภาพ PNG แล้วแสดงใน PreviewModal
   *
   * หมายเหตุ iOS:
   *  - iOS Safari มีปัญหากับ Gradient/Shadow ในการ render
   *  - ใช้เทคนิค "warm up" คือ render รอบแรกทิ้งก่อน 1 ครั้ง
   *    เพื่อให้ browser โหลด asset ครบ แล้วค่อย render รอบสองเอาจริง
   *  - รอ document.fonts.ready เพื่อให้ font โหลดเสร็จก่อน
   *  - รอ 2.5 วินาที เพื่อให้ iOS จัดการ layer ต่างๆ ครบ
   */
  const exportAsImage = async () => {
    if (receiptRef.current && !isExporting) {
      try {
        setIsExporting(true);

        // เคลียร์ blob URL เก่าออกจาก memory ก่อน (ถ้ามี) เพื่อป้องกัน memory leak
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage);
        }

        // รอให้ font โหลดเสร็จก่อน render
        await document.fonts.ready;

        // หน่วงเวลาให้ iOS จัดการ gradient/shadow/QR code ครบทุกเลเยอร์
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // ตั้งค่าการ render
        const options = {
          pixelRatio: 2, // ความละเอียด 2x (สำหรับหน้าจอ Retina)
          backgroundColor: '#0f172a',
          style: {
            fontFamily: '"Kanit", sans-serif',
          },
          // ตัด element ที่มี data-html2canvas-ignore ออก (เช่น ปุ่มลบ)
          filter: (node) => {
            if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) {
              return false;
            }
            return true;
          },
        };

        // ใช้ dynamic import เพื่อลดขนาด bundle ตอนโหลดครั้งแรก
        const { toBlob } = await import('html-to-image');

        // --- Warm up: render รอบแรกทิ้ง ---
        await toBlob(receiptRef.current, options);

        // --- Render รอบสอง: เอาข้อมูลจริง ---
        const blob = await toBlob(receiptRef.current, options);
        const imgUrl = URL.createObjectURL(blob);

        setPreviewImage(imgUrl);
      } catch (err) {
        console.error('Export failed', err);
        alert('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsExporting(false);
      }
    }
  };

  // เก็บ toPng ไว้เพื่อกัน tree-shaking ตัดออก (เผื่ออนาคตอยาก export เป็น data URL แทน blob)
  void toPng;

  // ============================================================
  // === Render ===
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-amber-500/30">

      {/* Modal แสดงรูป preview (แสดงเฉพาะเมื่อมีรูป) */}
      <PreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />

      <div className="max-w-md mx-auto space-y-8">
        {/* ===== Header ===== */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tight">
            โปรแกรมหารเหล้า
          </h1>

          {/* ปุ่มเริ่มบิลใหม่ (reload ทั้งหน้า) */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-[10px] font-black text-slate-600 hover:text-amber-500 transition-all flex items-center gap-1.5 uppercase tracking-[0.2em] group bg-slate-900/30 px-3 py-1.5 rounded-full border border-slate-800/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-180 transition-transform duration-500"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              เริ่มบิลใหม่
            </button>
          </div>
        </div>

        {/* ===== Section 1: เพิ่มสมาชิก ===== */}
        <MemberInput
          people={people}
          onAddNames={addNames}
          onRemovePerson={removePerson}
        />

        {/* ===== Section 2: เพิ่มรายการบิล (แสดงเมื่อมีคนแล้วอย่างน้อย 1 คน) ===== */}
        {people.length > 0 && (
          <ItemForm people={people} onAddItem={addItem} />
        )}

        {/* ===== Section 3: สรุปยอด + ปุ่ม action (แสดงเมื่อมีรายการแล้ว) ===== */}
        {items.length > 0 && (
          <div className="space-y-6">
            <Receipt
              ref={receiptRef}
              items={items}
              totals={totals}
              grandTotal={grandTotal}
              onRemoveItem={removeItem}
              qrCode={qrCode}
            />

            <div className="grid grid-cols-1 gap-4">
              {/* ปุ่มเพิ่ม/ลบ QR code (สลับตามสถานะ) */}
              {!qrCode ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-500 font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-lg"
                >
                  <span className="text-xl">➕</span> เพิ่ม QR CODE รับเงิน
                </button>
              ) : (
                <button
                  onClick={removeQr}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500/20 transition-all flex justify-center items-center gap-2"
                >
                  <span className="text-xl">🗑️</span> ลบ QR CODE
                </button>
              )}

              {/* input file ซ่อนไว้ (ถูก trigger ผ่าน ref) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleQrUpload}
                className="hidden"
                accept="image/*"
              />

              {/* ปุ่ม export เป็นรูปภาพ */}
              <button
                onClick={exportAsImage}
                disabled={isExporting}
                className="w-full bg-white text-slate-950 font-black py-5 rounded-[2rem] hover:bg-slate-200 active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] group overflow-hidden relative disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isExporting ? (
                    <>
                      {/* Spinner ตอนกำลังประมวลผล */}
                      <svg
                        className="animate-spin h-5 w-5 text-slate-950"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      กำลังประมวลผล...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📸</span> บันทึกรูปส่งให้เพื่อน
                    </>
                  )}
                </span>
                {/* แถบ shine ตอน hover (เฉพาะตอนไม่ได้ export อยู่) */}
                {!isExporting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <footer className="mt-16 text-center text-slate-700 text-[10px] font-bold uppercase pb-8">
        <p>Made by 
          <a href="mailto:setthawut_chaimongk@cmu.ac.th"> Setthawut Chaimongkol</a>
        </p>
      </footer>
    </div>
  );
}
