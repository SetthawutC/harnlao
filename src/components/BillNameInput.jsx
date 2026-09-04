export default function BillNameInput({ billName, onChange }) {
  return (
    <div className="relative max-w-sm mx-auto">
      <input
        type="text"
        value={billName}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ตั้งชื่อบิล..."
        maxLength={50}
        className="w-full bg-transparent border-b border-slate-800 pb-2 text-slate-200 text-lg font-medium text-center focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-700 placeholder:font-normal"
      />
    </div>
  );
}