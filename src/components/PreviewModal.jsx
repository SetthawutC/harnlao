/**
 * Modal แสดงภาพ preview ของใบเสร็จหลัง export
 *
 * Props:
 *  - imageUrl (string): URL ของ blob/image ที่จะแสดง
 *  - onClose  (function): callback เรียกเมื่อผู้ใช้กดปิด
 *
 * ถ้า imageUrl เป็น null/undefined จะไม่ render อะไรออกมา
 */
export default function PreviewModal({ imageUrl, onClose }) {
  // ถ้าไม่มีรูป ไม่ต้องแสดง modal
  if (!imageUrl) return null;

  return (
    // Backdrop: คลุมเต็มจอ มี blur เบื้องหลัง
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* กล่อง modal */}
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-6 overflow-hidden relative">

        {/* หัวข้อ + คำแนะนำวิธีบันทึกรูป */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-amber-400">บันทึกรูปภาพ</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            กดค้างที่รูปภาพด้านล่างแล้วเลือก <br />
            <span className="text-slate-200 font-bold">
              "บันทึกไปยังแอปรูปภาพ (Save to Photos) "
            </span>
            <br />
            <span className="text-slate-200 font-bold">
              "ในคอมพิวเตอร์คลิ๊กขวาเเละ (Save image) "
            </span>
          </p>
        </div>

        {/* รูป preview (scroll ได้ถ้ายาว) */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner max-h-[60vh] overflow-y-auto">
          <img src={imageUrl} alt="Receipt Preview" className="w-full h-auto" />
        </div>

        {/* ปุ่มปิด modal */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-2xl transition-all active:scale-95 border border-slate-700"
        >
          ปิดหน้าต่างนี้
        </button>
      </div>
    </div>
  );
}
