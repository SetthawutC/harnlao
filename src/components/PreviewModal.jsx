import { useEffect, useRef } from 'react';

/**
 * Modal แสดงภาพ preview ของใบเสร็จหลัง export
 *
 * Props:
 *  - imageUrl (string): URL ของ blob/image ที่จะแสดง
 *  - onClose  (function): callback เรียกเมื่อผู้ใช้กดปิด
 *
 * ถ้า imageUrl เป็น null/undefined จะไม่ render อะไรออกมา
 *
 * UX improvements:
 *  - กด Escape เพื่อปิด modal ได้
 *  - Focus trap: Tab วนอยู่ภายใน modal เท่านั้น
 *  - คำแนะนำบันทึกรูปแยกระหว่าง iOS/Android และ Desktop
 */
export default function PreviewModal({ imageUrl, onClose }) {
  const closeButtonRef = useRef(null);

  // ตรวจสอบว่าเป็น iOS หรือไม่ (เพื่อแสดงคำแนะนำที่เหมาะสม)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  useEffect(() => {
    if (!imageUrl) return;

    // โฟกัสที่ปุ่มปิดเมื่อ modal เปิด (accessibility)
    closeButtonRef.current?.focus();

    /**
     * ปิด modal เมื่อกด Escape
     */
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap: ดักจับ Tab ให้วนอยู่ใน modal
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          '[data-modal-focus] button, [data-modal-focus] a, [data-modal-focus] [tabindex]'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, onClose]);

  // ถ้าไม่มีรูป ไม่ต้องแสดง modal
  if (!imageUrl) return null;

  return (
    // Backdrop: คลุมเต็มจอ มี blur เบื้องหลัง — กดที่ backdrop เพื่อปิดได้
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={(e) => {
        // ปิด modal เมื่อกดที่ backdrop (นอก modal box)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* กล่อง modal */}
      <div
        data-modal-focus
        className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-5 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-label="บันทึกรูปภาพใบเสร็จ"
      >
        {/* หัวข้อ */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-amber-400">ใบเสร็จพร้อมแล้ว! 🎉</h3>
          <p className="text-xs text-slate-500">กดปิดหรือกด Esc เพื่อปิดหน้าต่างนี้</p>
        </div>

        {/* คำแนะนำวิธีบันทึก — แยกตาม platform */}
        <div className="bg-slate-950/60 rounded-2xl px-4 py-3 border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
          {isMobile ? (
            <>
              <p className="font-bold text-slate-300">
                {isIOS ? '📱 iPhone / iPad' : '📱 Android'}
              </p>
              <p>
                {isIOS
                  ? 'กด ค้างที่รูปภาพ → เลือก "บันทึกไปยังรูปภาพ"'
                  : 'กด ค้างที่รูปภาพ → เลือก "บันทึกรูปภาพ" หรือ "ดาวน์โหลด"'}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-slate-300">🖥️ คอมพิวเตอร์</p>
              <p>คลิกขวาที่รูปภาพ → เลือก <span className="text-slate-200 font-semibold">"Save image as…"</span></p>
            </>
          )}
        </div>

        {/* รูป preview (scroll ได้ถ้ายาว) */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner max-h-[55vh] overflow-y-auto">
          <img src={imageUrl} alt="ใบเสร็จสรุปยอดหาร" className="w-full h-auto" />
        </div>

        {/* ปุ่มปิด modal */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-2xl transition-all active:scale-95 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          ปิดหน้าต่างนี้
        </button>
      </div>
    </div>
  );
}
