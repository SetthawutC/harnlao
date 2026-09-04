import { useState, useRef, useMemo, useEffect } from 'react';
import MemberInput from './components/MemberInput';
import ItemForm from './components/ItemForm';
import Receipt from './components/Receipt';
import PreviewModal from './components/PreviewModal';
import BillNameInput from './components/BillNameInput';
import ItemEditModal from './components/ItemEditModal';
import BillHistory from './components/BillHistory';
import { calculateTotals, calculateGrandTotal } from './utils/calculations';
import { parseNames } from './utils/parsers';
import { loadSession, saveSession, clearSession, loadHistory, saveHistory } from './utils/storage';

/**
 * App หลัก — จัดการ state ทั้งหมดของแอป
 *
 * State ทั้งหมด:
 *  - billName    : ชื่อบิล (เช่น "วันเกิด Beer 🎂")
 *  - people      : รายชื่อคนในบิล
 *  - items       : รายการสินค้าในบิล
 *  - qrCode      : data URL ของรูป QR code (ถ้ามี)
 *  - isExporting : กำลัง export รูปอยู่หรือไม่
 *  - previewImage: blob URL ของรูปที่ export เสร็จแล้ว
 *  - editingItem : item ที่กำลังแก้ไข (null = ไม่ได้เปิด modal)
 *  - billHistory : ประวัติบิลที่บันทึกไว้ (array)
 *  - showHistory : แสดง/ซ่อน BillHistory panel
 *
 * Refs:
 *  - receiptRef   : ref ไปยัง DOM ของ Receipt (ใช้ capture เป็นรูป)
 *  - fileInputRef : ref ไปยัง <input type="file"> สำหรับอัปโหลด QR
 */
export default function App() {
  // ============================================================
  // === State (lazy init จาก localStorage ถ้ามี) ===
  // ============================================================
  const [billName, setBillName] = useState(() => loadSession()?.billName ?? '');
  const [people, setPeople] = useState(() => loadSession()?.people ?? []);
  const [items, setItems] = useState(() => loadSession()?.items ?? []);
  const [qrCode, setQrCode] = useState(() => loadSession()?.qrCode ?? null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [billHistory, setBillHistory] = useState(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);

  // Refs สำหรับเข้าถึง DOM โดยตรง
  const receiptRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================
  // === Auto-save session ไป localStorage ===
  // ============================================================
  useEffect(() => {
    saveSession({ billName, people, items, qrCode });
  }, [billName, people, items, qrCode]);


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
   * ใช้ crypto.randomUUID() เป็น id — ปลอดภัยกว่า Date.now()
   * ซึ่งอาจชน id กันได้หากเพิ่มรายการหลายรายการในช่วงเวลาเดียวกัน
   */
  const addItem = (newItemData) => {
    const newItem = {
      id: crypto.randomUUID(),
      ...newItemData,
    };
    setItems([...items, newItem]);
  };

  /** ลบรายการสินค้าตาม id */
  const removeItem = (idToRemove) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  /**
   * แก้ไขรายการสินค้าที่มีอยู่แล้ว
   * รับ id ของ item และ object ข้อมูลใหม่ { name, price, sharedBy }
   * แล้วปิด ItemEditModal
   */
  const updateItem = (id, updatedData) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    setEditingItem(null);
  };

  // ============================================================
  // === Bill History Handlers ===
  // ============================================================

  /**
   * บันทึก snapshot ของบิลปัจจุบันลงใน history
   * ไม่เก็บ qrCode เพื่อประหยัด localStorage space
   * @returns {object} bill ที่เพิ่งบันทึก
   */
  const saveBillToHistory = () => {
    const bill = {
      id: crypto.randomUUID(),
      billName: billName.trim() || 'บิลไม่มีชื่อ',
      date: new Date().toISOString(),
      people: [...people],
      items: [...items],
      grandTotal: calculateGrandTotal(items),
    };
    const newHistory = [bill, ...billHistory];
    setBillHistory(newHistory);
    saveHistory(newHistory);
    return bill;
  };

  /**
   * โหลดบิลจาก history กลับมาเป็น session ปัจจุบัน
   * ถ้า session ปัจจุบันมีข้อมูลอยู่ จะถามก่อน
   */
  const loadBillFromHistory = (id) => {
    const bill = billHistory.find((b) => b.id === id);
    if (!bill) return;
    const shouldReplace =
      items.length === 0 ||
      window.confirm(`แทนที่บิลปัจจุบันด้วย "${bill.billName}"?\n(บิลปัจจุบันจะหายไป)`);
    if (!shouldReplace) return;
    setBillName(bill.billName === 'บิลไม่มีชื่อ' ? '' : bill.billName);
    setPeople(bill.people);
    setItems(bill.items);
    setQrCode(null); // QR ไม่ได้เก็บใน history
    setShowHistory(false);
  };

  /** ลบบิลออกจาก history ตาม id */
  const deleteBillFromHistory = (id) => {
    const newHistory = billHistory.filter((b) => b.id !== id);
    setBillHistory(newHistory);
    saveHistory(newHistory);
  };

  /**
   * เริ่มบิลใหม่ — ถ้ามีรายการอยู่จะถามก่อนว่าจะบันทึกไว้ใน history
   * แล้ว clear ทั้ง state และ localStorage session
   */
  const handleNewBill = () => {
    if (items.length > 0) {
      const shouldSave = window.confirm(
        'บันทึกบิลนี้ไว้ในประวัติก่อนมั้ย?\n(กด OK = บันทึก, Cancel = ทิ้งเลย)'
      );
      if (shouldSave) saveBillToHistory();
    }
    setBillName('');
    setPeople([]);
    setItems([]);
    setQrCode(null);
    clearSession();
  };

  // ============================================================
  // === Derived values (ค่าที่คำนวณจาก state) ===
  // ============================================================
  // ใช้ useMemo เพื่อคำนวณใหม่เฉพาะเมื่อ people หรือ items เปลี่ยนแปลงเท่านั้น
  // ป้องกันการคำนวณซ้ำโดยไม่จำเป็นทุกครั้งที่ component re-render
  const totals = useMemo(() => calculateTotals(people, items), [people, items]);
  const grandTotal = useMemo(() => calculateGrandTotal(items), [items]);


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
   *  - บน iOS รอเพิ่ม 2.5 วินาที เพื่อให้จัดการ layer ต่างๆ ครบ
   *    (บน desktop/Android ไม่ต้องรอเพราะไม่มีปัญหานี้)
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

        // ตรวจสอบว่ากำลังรันบน iOS หรือไม่
        // ใส่ delay เฉพาะ iOS เพราะ Safari ต้องการเวลาเพิ่มเติมในการ render gradient/shadow
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }

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

  // ============================================================
  // === Render ===
  // ============================================================
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 p-4 md:p-10 selection:bg-amber-500/30">

      {/* ===== Modals & Panels ===== */}
      <PreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />

      {editingItem && (
        <ItemEditModal
          item={editingItem}
          people={people}
          onSave={(updatedData) => updateItem(editingItem.id, updatedData)}
          onClose={() => setEditingItem(null)}
        />
      )}

      {showHistory && (
        <BillHistory
          history={billHistory}
          onLoad={loadBillFromHistory}
          onDelete={deleteBillFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div className="max-w-md lg:max-w-2xl mx-auto space-y-10">

        {/* ===== Header ===== */}
        <div className="text-center space-y-5 pt-4">
          <h1 className="text-2xl font-semibold text-slate-100 tracking-wide flex items-center justify-center gap-2">
            โปรแกรมหารเหล้า <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
          </h1>

          <div className="flex justify-center items-center gap-6">
            <button
              onClick={handleNewBill}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              เริ่มบิลใหม่
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1.5 relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ประวัติบิล
              {billHistory.length > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-amber-500 text-amber-950 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                  {billHistory.length > 9 ? '9+' : billHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ===== ชื่อบิล ===== */}
        <BillNameInput billName={billName} onChange={setBillName} />

        {/* ===== Section 1: เพิ่มสมาชิก ===== */}
        <MemberInput
          people={people}
          onAddNames={addNames}
          onRemovePerson={removePerson}
        />

        {/* ===== Section 2: เพิ่มรายการบิล ===== */}
        {people.length > 0 && (
          <ItemForm people={people} onAddItem={addItem} />
        )}

        {/* ===== Empty state ===== */}
        {people.length > 0 && items.length === 0 && (
          <div className="text-center py-16 space-y-4 animate-in fade-in duration-700">
            <div className="text-4xl opacity-50 grayscale">🍽️</div>
            <p className="text-slate-500 text-sm font-medium tracking-wide">ยังไม่มีรายการในบิล</p>
          </div>
        )}

        {/* ===== Section 3: สรุปยอด + ปุ่ม action ===== */}
        {items.length > 0 && (
          <div className="space-y-8">
            <Receipt
              ref={receiptRef}
              items={items}
              totals={totals}
              grandTotal={grandTotal}
              onRemoveItem={removeItem}
              onEditItem={setEditingItem}
              qrCode={qrCode}
              billName={billName}
            />

            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto w-full">
              {!qrCode ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#13161c] text-amber-500/80 font-medium py-3.5 rounded-xl hover:bg-[#1a1e26] hover:text-amber-400 transition-all text-sm flex justify-center items-center gap-2 ring-1 ring-white/5"
                >
                  <span className="text-base">➕</span> เพิ่ม QR CODE
                </button>
              ) : (
                <button
                  onClick={removeQr}
                  className="w-full bg-red-950/20 text-red-400/80 font-medium py-3.5 rounded-xl hover:bg-red-900/30 hover:text-red-400 transition-all text-sm flex justify-center items-center gap-2 ring-1 ring-red-900/30"
                >
                  <span className="text-base">🗑️</span> ลบ QR CODE
                </button>
              )}

              <input type="file" ref={fileInputRef} onChange={handleQrUpload} className="hidden" accept="image/*" />

              <button
                onClick={() => { saveBillToHistory(); alert('บันทึกบิลเรียบร้อยแล้ว! 💾'); }}
                className="w-full bg-[#13161c] text-slate-300 font-medium py-3.5 rounded-xl hover:bg-[#1a1e26] hover:text-white transition-all text-sm flex justify-center items-center gap-2 ring-1 ring-white/5"
              >
                <span className="text-base">💾</span> บันทึกไว้ในประวัติ
              </button>

              <button
                onClick={exportAsImage}
                disabled={isExporting}
                className="w-full bg-slate-100 text-slate-900 font-semibold py-4 rounded-xl hover:bg-white transition-all text-sm flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 mt-2"
              >
                {isExporting ? (
                  <span className="animate-pulse">กำลังประมวลผล...</span>
                ) : (
                  <>บันทึกรูปส่งให้เพื่อน</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <footer className="mt-24 text-center text-slate-600 text-[10px] font-medium tracking-widest uppercase pb-8">
        <p>Made with ❤️ by Setthawut</p>
      </footer>
    </div>
  );
}