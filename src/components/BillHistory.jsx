import { useEffect } from 'react';

/**
 * BillHistory — modal แสดงประวัติบิลที่บันทึกไว้
 *
 * Props:
 *  - history              (Array)    : รายการบิลทั้งหมด
 *  - onLoad   (function)             : โหลดบิลเก่ากลับมาแก้ไข รับ id
 *  - onDelete (function)             : ลบบิลออกจาก history รับ id
 *  - onClose  (function)             : ปิด modal
 */
export default function BillHistory({ history, onLoad, onDelete, onClose }) {
  // ปิดด้วย Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet panel — slide up จากด้านล่างบน mobile, centered บน sm+ */}
      <div
        className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="ประวัติบิล"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-100">📋 ประวัติบิล</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{history.length} รายการ</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all font-bold text-lg"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {history.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🗂️</div>
              <p className="text-slate-500 text-sm">ยังไม่มีประวัติบิล</p>
              <p className="text-slate-600 text-xs">กดปุ่ม "💾 บันทึกบิลนี้" เพื่อเก็บบิลปัจจุบัน</p>
            </div>
          ) : (
            history.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onLoad={onLoad}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * BillCard — card แสดงข้อมูลบิลใน history แต่ละรายการ
 */
function BillCard({ bill, onLoad, onDelete }) {
  // Format วันที่เป็นภาษาไทย
  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(bill.date));

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`ลบบิล "${bill.billName}" ออกจากประวัติ?`)) {
      onDelete(bill.id);
    }
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all">
      {/* Bill info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-200 text-sm truncate">{bill.billName}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{formattedDate}</p>
        </div>
        {/* Grand total badge */}
        <div className="text-right flex-shrink-0">
          <p className="font-black text-amber-400 text-base tabular-nums leading-none">
            {bill.grandTotal.toLocaleString()}
          </p>
          <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5">บาท</p>
        </div>
      </div>

      {/* Meta: จำนวนคน + รายการ */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        <span>👥 {bill.people.length} คน</span>
        <span>•</span>
        <span>🍽️ {bill.items.length} รายการ</span>
        <span>•</span>
        {/* ชื่อคนสั้นๆ */}
        <span className="truncate">{bill.people.slice(0, 3).join(', ')}{bill.people.length > 3 ? ` +${bill.people.length - 3}` : ''}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onLoad(bill.id)}
          className="flex-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <span>📂</span> โหลดมาแก้ไข
        </button>
        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
          aria-label="ลบบิลนี้"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
