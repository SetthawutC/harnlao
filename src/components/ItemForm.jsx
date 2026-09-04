import { useState } from 'react';

export default function ItemForm({ people, onAddItem }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const [selectedPeople, setSelectedPeople] = useState(people);
  const [prevPeople, setPrevPeople] = useState(people);

  if (prevPeople !== people) {
    setPrevPeople(people);
    setSelectedPeople(people);
  }

  const togglePersonSelection = (person) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter((p) => p !== person));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || selectedPeople.length === 0) return;

    onAddItem({
      name: itemName,
      price: parseFloat(itemPrice),
      sharedBy: [...selectedPeople],
    });

    setItemName('');
    setItemPrice('');
    setSelectedPeople([...people]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#13161c] p-6 md:p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/5 space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4">
        <h2 className="text-xl font-semibold text-slate-200">2. รายการอาหาร/เครื่องดื่ม</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">ชื่อรายการ</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="เช่น เหล้า, มิกเซอร์, กับแกล้ม"
            required
            className="w-full bg-slate-950/50 text-slate-200 text-sm px-5 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-700 transition-all placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">ราคา (บาท)</label>
          <input
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="0.00"
            required
            min="1"
            step="any"
            className="w-full bg-slate-950/50 text-slate-200 text-sm px-5 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-700 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500">ใครหารบ้าง?</label>
          <button
            type="button"
            onClick={() => {
              if (selectedPeople.length === people.length) {
                setSelectedPeople([]);
              } else {
                setSelectedPeople([...people]);
              }
            }}
            className="text-[10px] font-medium text-amber-500/80 hover:text-amber-400 transition-colors bg-amber-500/10 px-2.5 py-1 rounded-md"
          >
            {selectedPeople.length === people.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {people.map((person) => {
            const isSelected = selectedPeople.includes(person);
            return (
              <button
                key={person}
                type="button"
                onClick={() => togglePersonSelection(person)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-slate-200 text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-100 ring-1 ring-slate-200'
                    : 'bg-slate-950/50 text-slate-500 hover:bg-slate-800 scale-95 ring-1 ring-transparent'
                }`}
              >
                {person}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={selectedPeople.length === 0}
        className="w-full bg-amber-500 text-amber-950 font-semibold py-4 rounded-2xl hover:bg-amber-400 transition-all text-sm flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      >
        <span className="text-lg">➕</span> เพิ่มรายการ
      </button>

      {selectedPeople.length === 0 && (
        <p className="text-center text-amber-500/70 text-xs mt-2 animate-in fade-in">
          กรุณาเลือกอย่างน้อย 1 คนเพื่อหารรายการนี้
        </p>
      )}
    </form>
  );
}