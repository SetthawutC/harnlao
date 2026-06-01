import { useState } from 'react';

export default function MemberInput({ people, onAddNames, onRemovePerson }) {
  const [nameInput, setNameInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleAdd = () => {
    if (nameInput.trim()) {
      onAddNames(nameInput);
      setNameInput('');
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl">
      <h2 className="text-[20px] font-semibold mb-4 flex items-center justify-center text-amber-400">
        <span className="text-2xl">🧑🏻‍🤝‍🧑🏻</span> ใครมาบ้าง?
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ใส่ชื่อ (เว้นวรรคเพื่อใส่หลายคน)"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600"
        />
        <button
          onClick={handleAdd}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          เพิ่ม
        </button>
      </div>
      
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {people.map((person) => (
            <span
              key={person}
              className="bg-slate-800 text-slate-200 pl-4 pr-2 py-1.5 rounded-full text-sm flex items-center gap-2 border border-slate-700 animate-in fade-in zoom-in duration-200"
            >
              {person}
              <button 
                onClick={() => onRemovePerson(person)} 
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
