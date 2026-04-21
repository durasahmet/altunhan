"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, MessageCircle, AlertTriangle, QrCode } from "lucide-react";

export default function Step5Success({ data, reservationCode, slideVariants }: any) {
  const [copied, setCopied] = useState(false);

  const ibanNumber = "TR28 0001 0021 6273 2970 1150 03";
  const whatsappNumber = "0540 747 22 22"; // 🚀 Güncellenen WhatsApp Numarası

  // İBAN Kopyalama Fonksiyonu
  const handleCopyIban = () => {
    navigator.clipboard.writeText(ibanNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  // Sadece rakam ve harflerden oluşan boşluksuz IBAN (QR kod için)
  const cleanIban = ibanNumber.replace(/\s/g, '');

  return (
    <motion.div key="step5" variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full text-center py-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
        <CheckCircle2 size={72} className="text-green-500 mb-4" />
      </motion.div>
      
      <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--color-brand-green)' }}>Talebiniz Alındı!</h2>
      <p className="text-gray-500 font-medium mb-6">Rezervasyonunuzun onaylanması için lütfen ödemenizi tamamlayın.</p>

      {/* 1. ÖDEME BİLGİLERİ KARTI */}
      <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Açıklama Kısmına Yazılacak Kod</p>
        <p className="text-3xl font-black tracking-widest mb-4 bg-orange-100 text-orange-600 inline-block px-4 py-1 rounded-lg">
          {reservationCode}
        </p>
        
        <div className="text-left bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
          
          <div className="flex-1 w-full">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Alıcı Adı Soyadı</p>
            <p className="font-bold text-gray-800 mb-4">Muhammed Korkuc</p>

            <p className="text-xs text-gray-400 font-bold uppercase mb-1">IBAN Numarası</p>
            <div className="flex items-center justify-between bg-gray-50 p-2 pl-3 rounded-lg border border-gray-200 mb-4">
              <p className="font-mono font-bold text-gray-800 text-xs sm:text-sm tracking-wide">{ibanNumber}</p>
              <button 
                onClick={handleCopyIban} 
                className={`p-2 rounded-lg transition-all flex-shrink-0 ml-2 ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-gray-500 shadow-sm hover:text-orange-500 border border-gray-200'}`}
                title="IBAN'ı Kopyala"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Gönderilecek Tutar:</span>
              <span className="text-lg font-black text-green-600">{data.package?.price?.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          {/* QR KOD BÖLÜMÜ */}
          <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner w-full md:w-auto">
            <div className="bg-white p-2 rounded-xl shadow-sm mb-2 border border-gray-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cleanIban}&margin=10`} 
                alt="IBAN QR Kodu" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <QrCode size={12} /> Kameradan Okutun
            </p>
          </div>

        </div>
      </div>

      {/* 2. DİKKAT ÇEKİCİ WHATSAPP & DEKONT UYARISI */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="w-full bg-green-50 border-2 border-green-500 rounded-2xl p-5 mb-8 relative overflow-hidden"
      >
        <MessageCircle className="absolute -right-4 -top-4 text-green-200/50" size={100} />
        
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-green-600" size={20} />
            <h3 className="font-black text-green-800 uppercase tracking-wide">Önemli Son Adım</h3>
          </div>
          <p className="text-sm text-green-700 font-medium mb-3">
            Ödemenizi tamamladıktan sonra, işlemlerinizin hızla onaylanması için lütfen <strong>dekontunuzu aşağıdaki WhatsApp hattımıza iletiniz.</strong>
          </p>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-green-200 shadow-sm w-fit">
            <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
              <MessageCircle className="text-white" size={20} />
            </div>
            {/* WhatsApp numarasına tıklanabilir link özelliği eklendi */}
            <a href={`https://wa.me/90${whatsappNumber.replace(/\s/g, '').substring(1)}`} target="_blank" rel="noopener noreferrer" className="font-black text-green-800 text-lg tracking-wide hover:underline cursor-pointer">
              {whatsappNumber}
            </a>
          </div>
          <p className="text-xs text-green-600 font-bold mt-3">
            ✓ Dekontunuz onaylandığında giriş QR kodunuz SMS ile gönderilecektir.
          </p>
        </div>
      </motion.div>

      <button onClick={() => window.location.reload()} className="w-full py-4 text-white rounded-xl font-bold transition-all shadow-lg hover:opacity-90" style={{ backgroundColor: 'var(--color-brand-green)' }}>
        Ana Sayfaya Dön
      </button>
    </motion.div>
  );
}