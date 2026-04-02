"use client";
import { motion } from "framer-motion";
import { CheckCircle2, FileText } from "lucide-react";

export default function Step5Success({ data, reservationCode, slideVariants }: any) {
  return (
    <motion.div key="step5" variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
        <CheckCircle2 size={80} className="text-green-500 mb-6" />
      </motion.div>
      
      <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-brand-green)' }}>Talebiniz Alındı!</h2>
      <p className="text-gray-600 mb-8">Rezervasyonunuzun onaylanması için lütfen ödemenizi tamamlayın.</p>

      <div className="w-full bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
        <p className="text-sm text-gray-500 mb-1">Açıklama Kısmına Yazılacak Kod:</p>
        <p className="text-3xl font-black tracking-wider mb-4" style={{ color: 'var(--color-brand-orange)' }}>{reservationCode}</p>
        
        <div className="text-left bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
          <p className="text-sm text-gray-500">Alıcı: Altunhan Turizm ve Konaklama Ltd. Şti.</p>
          <p className="font-mono font-bold text-gray-800 my-1">TR00 0000 0000 0000 0000 0000 00</p>
          <p className="text-sm font-semibold text-green-700 mt-2">Gönderilecek Tutar: {data.package?.price?.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
        <FileText size={16} /> Ödemeniz onaylandığında giriş QR kodunuz SMS ile iletilecektir.
      </p>

      <button onClick={() => window.location.reload()} className="w-full py-4 text-white rounded-xl font-bold transition-all" style={{ backgroundColor: 'var(--color-brand-green)' }}>
        Ana Sayfaya Dön
      </button>
    </motion.div>
  );
}