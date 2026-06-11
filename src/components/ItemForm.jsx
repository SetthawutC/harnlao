import { useState, useEffect } from 'react';

/**
 * ItemForm — ฟอร์มเพิ่มรายการสินค้าในบิล
 *
 * Props:
 *  - people     (string[])                : รายชื่อคนทั้งหมด (ใช้เป็นตัวเลือกว่าใครหารบ้าง)
 *  - onAddItem  (function)                : เรียกเมื่อ user submit ฟอร์ม รับ object { name, price, sharedBy }
 */
export default function ItemForm({ people, onAddItem }) {
  // state ของฟอร์ม
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);

  /**
   * useEffect: ทุกครั้งที่รายชื่อคนเปลี่ยน (เช่น มีการเพิ่ม/ลบคน)
   * ให้ "เลือกทุกคนเป็นค่า default" (ทำให้ user ไม่ต้องติ๊กใหม่ทุกครั้ง)
   *
   * หมายเหตุ: เป็นพฤติกรรมเดิมของแอป — ใช้ spread `people` เพราะ array ใหม่
   * จะ trigger ให้ state เปลี่ยน (React เช็ค reference equality)
   */
  useEffect(() => {
    setSelectedPeople([...people]);
  }, [people]);

  /**
   * สลับการเลือก/ยกเลิกเลือกคน
   * - ถ้าเลือกอยู่ → เอาออก
   * - ถ้ายังไม่เลือก → เพิ่มเข้า
   */
  const togglePersonSelection = (person) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter((p) => p !== person));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  /**
   * Submit ฟอร์มเพิ่มรายการ
   * Validation: ต้องมีชื่อ + ราคา + อย่างน้อย 1 คนที่หาร
   * หลัง submit แล้ว clear form และ reset การเลือกคนเป็น "เลือกทั้งหมด"
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || selectedPeople.length === 0) return;

    onAddItem({
      name: itemName,
      price: parseFloat(itemPrice),
      sharedBy: [...selectedPeople],
    });

    // clear form
    setItemName('');
    setItemPrice('');
    // reset เป็น "เลือกทุกคน" เพื่อให้พร้อมเพิ่มรายการถัดไป
    setSelectedPeople([...people]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6"
    >
      {/* ===== หัวข้อฟอร์ม ===== */}
      <h2 className="text-lg font-semibold flex items-center gap-2 justify-center text-amber-400">
        <span className="text-2xl">📝</span> เพิ่มรายการบิล
      </h2>

      {/* ===== ช่องกรอก: ชื่อรายการ + ราคา ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* ชื่อรายการ */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">
            ชื่อรายการ
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="เช่น เหล้า, มิกเซอร์"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
            required
          />
        </div>

        {/* ราคา */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">
            ราคา (บาท)
          </label>
          <input
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600 font-mono"
            required
          />
        </div>
      </div>

      {/* ===== ตัวเลือก "ใครหารบ้าง?" ===== */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">
          ใครหารบ้าง?
        </label>
        <div className="flex flex-wrap gap-2">
          {people.map((person) => (
            <PersonToggle
              key={person}
              name={person}
              isSelected={selectedPeople.includes(person)}
              onToggle={togglePersonSelection}
            />
          ))}
        </div>
      </div>

      {/* ===== ปุ่ม submit ===== */}
      <button
        type="submit"
        disabled={selectedPeople.length === 0}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-slate-950 font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 uppercase tracking-widest"
      >
        เพิ่มลงบิล
      </button>
    </form>
  );
}

/**
 * PersonToggle — toggle chip สำหรับเลือก/ยกเลิกเลือกคนที่หาร
 * (แยกเป็น internal component เพื่อให้ ItemForm อ่านง่ายขึ้น)
 *
 * Props:
 *  - name       (string)   : ชื่อคน
 *  - isSelected (boolean)  : เลือกอยู่หรือไม่
 *  - onToggle   (function) : callback รับชื่อคนเพื่อสลับสถานะ
 */
function PersonToggle({ name, isSelected, onToggle }) {
  return (
    <label
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
      }`}
    >
      {/* checkbox จริง (ซ่อนไว้ ใช้ sr-only) — เก็บไว้เพื่อให้ form/accessibility ใช้งานได้ */}
      <div className="relative flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(name)}
          className="sr-only"
        />
        {/* checkbox ปลอม (UI สวยงาม) */}
        <div
          className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
            isSelected
              ? 'bg-amber-500 border-amber-500'
              : 'bg-transparent border-slate-700'
          }`}
        >
          {isSelected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-950"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      <span className="text-sm font-medium whitespace-nowrap">{name}</span>
    </label>
  );
}
