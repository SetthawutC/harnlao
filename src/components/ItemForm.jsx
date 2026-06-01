import { useState, useEffect } from 'react';

export default function ItemForm({ people, onAddItem }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);

  // อัปเดตคนที่ถูกเลือกเมื่อรายชื่อรวมเปลี่ยน
  useEffect(() => {
    setSelectedPeople([...people]);
  }, [people]);

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
    // คืนค่าให้เลือกทุกคนเป็นค่าเริ่มต้น
    setSelectedPeople([...people]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 justify-center text-amber-400">
        <span className="text-2xl">📝</span> เพิ่มรายการบิล
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">ชื่อรายการ</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="เช่น เหล้า, มิกเซอร์"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">ราคา (บาท)</label>
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

      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">ใครหารบ้าง?</label>
        <div className="flex flex-wrap gap-2">
          {people.map((person) => {
            const isSelected = selectedPeople.includes(person);
            return (
              <label
                key={person}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePersonSelection(person)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    isSelected 
                      ? 'bg-amber-500 border-amber-500' 
                      : 'bg-transparent border-slate-700'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-slate-950">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{person}</span>
              </label>
            );
          })}
        </div>
      </div>

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
