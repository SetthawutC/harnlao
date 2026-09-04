import { useState, useEffect } from 'react';

export default function MemberInput({ people, onAddNames, onRemovePerson }) {
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const names = inputValue.split(' ').filter((n) => n.trim() !== '');
    const duplicates = names.filter((name) => people.includes(name));

    if (duplicates.length > 0) {
      setErrorMsg(`ชื่อซ้ำ: ${duplicates.join(', ')}`);
      return;
    }

    onAddNames(inputValue);
    setInputValue('');
    setErrorMsg('');
  };

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  return (
    <div className="bg-[#13161c] p-6 md:p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/5 space-y-6 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-slate-200">1. ใครกินบ้าง?</h2>
        <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">
          {people.length} คน
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="พิมพ์ชื่อ (เว้นวรรคเพื่อเพิ่มหลายคน)"
          className={`flex-1 bg-slate-950/50 text-slate-200 text-sm px-5 py-4 rounded-2xl focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
            errorMsg ? 'ring-1 ring-red-500/50 bg-red-950/10' : 'ring-1 ring-transparent focus:ring-slate-700'
          }`}
        />
        <button
          type="submit"
          className="bg-slate-100 text-slate-900 font-semibold px-6 py-4 rounded-2xl hover:bg-white active:scale-95 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          เพิ่ม
        </button>
      </form>

      {errorMsg && (
        <p className="text-red-400 text-xs font-medium mt-2 animate-in fade-in slide-in-from-top-1" role="alert">
          {errorMsg}
        </p>
      )}

      {people.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50">
          {people.map((person) => (
            <div
              key={person}
              className="group flex items-center bg-slate-950/50 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl ring-1 ring-white/5 hover:ring-white/10 transition-all cursor-default"
            >
              {person}
              <button
                type="button"
                onClick={() => onRemovePerson(person)}
                className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-slate-500 group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors"
                aria-label={`ลบ ${person}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}