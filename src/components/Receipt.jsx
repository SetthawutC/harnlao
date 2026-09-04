import { forwardRef } from 'react';

const Receipt = forwardRef(({ items, totals, grandTotal, onRemoveItem, onEditItem, qrCode, billName }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-[#13161c] p-8 md:p-10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/5 space-y-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-400/50 to-amber-500/20"></div>
      
      <ReceiptHeader billName={billName} date={new Date().toLocaleDateString('th-TH')} />

      <div className="space-y-4">
        {items.map((item, index) => (
          <ItemRow key={item.id} index={index} item={item} onRemove={onRemoveItem} onEdit={onEditItem} />
        ))}
      </div>

      <div className="border-t border-dashed border-slate-700/50 pt-6">
        <GrandTotalRow total={grandTotal} />
      </div>

      <div className="border-t border-dashed border-slate-700/50 pt-6">
        <div className="text-center mb-6">
          <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">สรุปยอดที่ต้องจ่าย</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(totals)
            .filter(([, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([person, amount]) => (
              <PersonSummary key={person} person={person} amount={amount} />
            ))}
            
          {Object.entries(totals).filter(([, amount]) => amount === 0).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-medium">รอดตัว (ไม่ต้องจ่าย)</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(totals)
                  .filter(([, amount]) => amount === 0)
                  .map(([person]) => (
                    <PersonSummaryZero key={person} person={person} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {qrCode && <QrCodeSection qrCode={qrCode} />}
    </div>
  );
});

function ReceiptHeader({ billName, date }) {
  return (
    <div className="text-center space-y-1 mb-6">
      <h2 className="text-2xl font-bold text-slate-200 tracking-wide">{billName || 'สรุปบิล'}</h2>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{date}</p>
    </div>
  );
}

function ItemRow({ index, item, onRemove, onEdit }) {
  return (
    <div className="group relative flex flex-col p-4 bg-slate-900/40 rounded-2xl hover:bg-slate-900/80 transition-colors ring-1 ring-transparent hover:ring-white/5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-medium text-sm">{index + 1}.</span>
          <span className="font-semibold text-slate-200">{item.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300">฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <div className="flex gap-1" data-html2canvas-ignore>
            {onEdit && (
              <button onClick={() => onEdit(item)} className="p-1.5 text-slate-500 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="แก้ไขรายการ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
            )}
            <button onClick={() => onRemove(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors" title="ลบรายการ">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="pl-6 flex flex-wrap gap-1.5">
        {item.sharedBy.map((person) => (
          <span key={person} className="text-[10px] font-medium bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800/50">
            {person}
          </span>
        ))}
      </div>
    </div>
  );
}

function GrandTotalRow({ total }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">ยอดรวมทั้งหมด</span>
      <span className="text-3xl font-bold text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
        ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function PersonSummary({ person, amount }) {
  return (
    <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl ring-1 ring-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs ring-1 ring-white/5">
          {person.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-slate-200">{person}</span>
      </div>
      <span className="font-bold text-amber-400 text-lg">
        ฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function PersonSummaryZero({ person }) {
  return (
    <span className="text-[10px] font-medium bg-slate-900/50 text-slate-500 px-2 py-1 rounded-md border border-slate-800/50 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
      {person}
    </span>
  );
}

function QrCodeSection({ qrCode }) {
  return (
    <div className="mt-8 pt-8 border-t border-dashed border-slate-700/50 flex flex-col items-center">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">สแกนจ่ายเงิน</p>
      <div className="bg-white p-3 rounded-2xl shadow-xl">
        <img src={qrCode} alt="QR Code" className="w-40 h-40 object-contain rounded-xl" />
      </div>
    </div>
  );
}

export default Receipt;