import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import MemberInput from './components/MemberInput';
import ItemForm from './components/ItemForm';
import Receipt from './components/Receipt';

export default function App() {
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const receiptRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCode(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQr = () => {
    setQrCode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addNames = (input) => {
    const newNames = input
      .split(' ')
      .map((n) => n.trim())
      .filter((n) => n !== '' && !people.includes(n));

    if (newNames.length > 0) {
      setPeople([...people, ...newNames]);
    }
  };

  const removePerson = (nameToRemove) => {
    setPeople(people.filter((name) => name !== nameToRemove));
  };

  const addItem = (newItemData) => {
    const newItem = {
      id: Date.now(),
      ...newItemData,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (idToRemove) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  // --- Calculations ---
  const calculateTotals = () => {
    const totals = {};
    people.forEach((person) => {
      totals[person] = 0;
    });

    items.forEach((item) => {
      const splitCount = item.sharedBy.length;
      if (splitCount > 0) {
        const costPerPerson = item.price / splitCount;
        item.sharedBy.forEach((person) => {
          if (totals[person] !== undefined) {
            totals[person] += costPerPerson;
          }
        });
      }
    });

    return totals;
  };

  const totals = calculateTotals();
  const grandTotal = items.reduce((sum, item) => sum + item.price, 0);

  const exportAsImage = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await toPng(receiptRef.current, {
          pixelRatio: 2, // เพิ่มความคมชัด
          backgroundColor: '#0f172a',
          filter: (node) => {
            // ซ่อนปุ่มลบตอนเซฟรูป
            if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) {
              return false;
            }
            return true;
          }
        });
        
        const link = document.createElement('a');
        link.download = `harnlao-bill-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed', err);
        alert('ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-amber-500/30">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tight">
            โปรแกรมหารเหล้า
          </h1>
          

          {/* Reset Button (Moved) */}
          <div className="flex justify-center pt-2">
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-black text-slate-600 hover:text-amber-500 transition-all flex items-center gap-1.5 uppercase tracking-[0.2em] group bg-slate-900/30 px-3 py-1.5 rounded-full border border-slate-800/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
              เริ่มบิลใหม่
            </button>
          </div>
        </div>

        {/* Section 1: Members */}
        <MemberInput 
          people={people} 
          onAddNames={addNames} 
          onRemovePerson={removePerson} 
        />

        {/* Section 2: Add Bill Items */}
        {people.length > 0 && (
          <ItemForm 
            people={people} 
            onAddItem={addItem} 
          />
        )}

        {/* Section 3: Summary */}
        {items.length > 0 && (
          <div className="space-y-6">
            <Receipt 
              ref={receiptRef}
              items={items}
              totals={totals}
              grandTotal={grandTotal}
              onRemoveItem={removeItem}
              qrCode={qrCode}
            />

            <div className="grid grid-cols-1 gap-4">
              {/* QR Code Upload Button */}
              {!qrCode ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-500 font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-lg"
                >
                  <span className="text-xl">➕</span> เพิ่ม QR CODE รับเงิน
                </button>
              ) : (
                <button
                  onClick={removeQr}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500/20 transition-all flex justify-center items-center gap-2"
                >
                  <span className="text-xl">🗑️</span> ลบ QR CODE
                </button>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleQrUpload} 
                className="hidden" 
                accept="image/*"
              />

              <button
                onClick={exportAsImage}
                className="w-full bg-white text-slate-950 font-black py-5 rounded-[2rem] hover:bg-slate-200 active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">📸</span> บันทึกรูปส่งให้เพื่อน
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Branding */}
      <footer className="mt-16 text-center text-slate-700 text-[10px] font-bold uppercase pb-8">
        สร้างโดย Setthawut_Chaimongk@cmu.ac.th
      </footer>
    </div>
  );
}
