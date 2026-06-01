import { forwardRef } from 'react';

const Receipt = forwardRef(({ items, totals, grandTotal, onRemoveItem, qrCode }, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative elements for receipt */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      
      {/* Receipt Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight flex flex-col items-center gap-1">
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Receipt</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-100 to-slate-400">สรุปยอดหาร</span>
        </h2>
        <div className="w-10 h-1 bg-amber-500 mx-auto mt-2 rounded-full"></div>
      </div>
      
      {/* Items Section */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">รายการที่สั่ง</h3>
          <div className="h-px w-full bg-slate-800/50"></div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start group animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex-1 pr-4">
                <div className="text-base font-semibold text-slate-200 tracking-wide leading-tight">{item.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider">หารโดย</span>
                  <p className="text-slate-400 font-medium leading-none">
                    {item.sharedBy.join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-300 tabular-nums tracking-normal">
                  {item.price.toLocaleString()} บาท
                </span>
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                  data-html2canvas-ignore
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="pt-4 border-t border-slate-800 mt-4">
          <div className="flex justify-between items-end bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
            <div>
              <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em] mb-0.5">Grand Total</div>
              <div className="text-sm font-bold text-slate-100 tracking-tight">ยอดรวมทั้งหมด</div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-slate-100 tabular-nums tracking-normal">
                {grandTotal.toLocaleString()}
                <span className="text-xs ml-2 text-slate-500 font-bold uppercase">บาท</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">สรุปยอดรายคน</h3>
          <div className="h-px w-full bg-slate-800/50"></div>
        </div>

        <div className="grid gap-2">
          {Object.entries(totals).map(([person, amount]) => (
            amount > 0 && (
              <div key={person} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group shadow-sm">
                <span className="text-sm font-bold text-slate-300 tracking-wide">{person}</span>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-500 tabular-nums tracking-normal leading-none">
                    {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[10px] ml-2 text-slate-500 font-bold uppercase">บาท</span>
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
        
        {/* QR Code Section */}
        {qrCode && (
          <div className="mt-6 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="relative group">
              <div className="absolute -inset-4 bg-amber-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="relative bg-white p-3 rounded-3xl shadow-2xl border-4 border-slate-800">
                <img 
                  src={qrCode} 
                  alt="Payment QR" 
                  className="w-44 h-44 object-contain"
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-[0.3em] font-black">สแกนเพื่อโอนเงิน</p>
          </div>
        )}
        
        
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
