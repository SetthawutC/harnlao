import { useState, useEffect, useRef } from 'react';

/**
 * ItemEditModal — modal สำหรับแก้ไขรายการที่เพิ่มไปแล้ว
 *
 * Props:
 *  - item    ({ id, name, price, sharedBy }) : รายการที่จะแก้ไข
 *  - people  (string[])                      : รายชื่อคนทั้งหมด (ใช้สร้าง toggle chip)
 *  - onSave  (function)                      : callback รับ { name, price, sharedBy }
 *  - onClose (function)                      : callback เมื่อปิด modal
 *
 * UX:
 *  - กด Escape หรือกด backdrop เพื่อปิด
 *  - Focus ที่ช่องชื่อตอนเปิด
 */
export default function ItemEditModal({ item, people, onSave, onClose }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const [selectedPeople, setSelectedPeople] = useState([...item.sharedBy]);
  const nameInputRef = useRef(null);

  // Focus ที่ช่องชื่อตอนเปิด modal
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // ปิด modal เมื่อกด Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const togglePerson = (person) => {
    setSelectedPeople((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !price || selectedPeople.length === 0) return;
    onSave({
      name: name.trim(),
      price: parseFloat(price),
      sharedBy: selectedPeople,
    });
  };

  const isValid = name.trim() && price && parseFloat(price) > 0 && selectedPeople.length > 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="แก้ไขรายการ"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <span>✏️</span> แก้ไขรายการ
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* ชื่อ + ราคา */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ชื่อรายการ
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ราคา (บาท)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="any"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                required
              />
            </div>
          </div>

          {/* ใครหารบ้าง */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ใครหารบ้าง?
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedPeople(
                    selectedPeople.length === people.length ? [] : [...people]
                  )
                }
                className="text-[10px] text-amber-500 hover:text-amber-400 font-bold transition-colors"
              >
                {selectedPeople.length === people.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {people.map((person) => {
                const isSelected = selectedPeople.includes(person);
                return (
                  <label
                    key={person}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all text-sm ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePerson(person)}
                      className="sr-only"
                    />
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-700'
                    }`}>
                      {isSelected && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-slate-950">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="whitespace-nowrap font-medium">{person}</span>
                  </label>
                );
              })}
            </div>
            {selectedPeople.length === 0 && (
              <p className="text-[11px] text-red-400 animate-in fade-in duration-200" role="alert">
                กรุณาเลือกอย่างน้อย 1 คน
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
