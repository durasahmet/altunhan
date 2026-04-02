"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Step4UserInfo({
  data,
  setData,
  onPrev,
  onComplete, // 5. adıma geçiren fonksiyon
  slideVariants
}: any) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Bitiş tarihini akıllıca hesaplayan güncel fonksiyon (2. Adımdaki gibi)
  const calculateEndDate = () => {
    if (!data.startDate || !data.package) return "Hesaplanıyor...";
    
    const start = new Date(data.startDate);
    
    // "30 Gün" metninin içinden sadece '30' rakamını çeker
    const days = parseInt(String(data.package.duration).replace(/\D/g, ''), 10) || 0; 
    
    // Bitiş tarihini hesapla
    const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Şık Türkçe format (Örn: 14 Mayıs 2026)
    return end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Başlangıç tarihini şık formatta göstermek için yardımcı fonksiyon
  const formatStartDate = () => {
    if (!data.startDate) return "";
    const start = new Date(data.startDate);
    return start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleInputChange = (field: string, value: string) => {
    setData({
      ...data,
      customer: { ...data.customer, [field]: value }
    });
  };

  const isValid = termsAccepted && data.customer.name && data.customer.phone;

  return (
    <motion.div key="step4" variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-brand-green)' }}>Kişisel Bilgileriniz</h2>
      
      {/* Sipariş Özeti Kartı */}
      <div className="mb-6 p-5 rounded-2xl text-white shadow-lg" style={{ backgroundColor: 'var(--color-brand-green)' }}>
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
          <div>
            <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Seçiminiz</p>
            <p className="font-black text-lg">{data.category?.name}</p>
            <p className="font-medium text-green-100">{data.package?.name} ({data.package?.duration})</p>
            <p className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mt-2">Parsel: {data.parcel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Toplam Tutar</p>
            <p className="text-2xl font-black text-orange-400">{data.package?.price?.toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 text-sm font-bold bg-black/20 p-3 rounded-xl">
          <span>{formatStartDate()}</span> 
          <ArrowRight className="text-orange-400" size={16}/> 
          <span>{calculateEndDate()}</span>
        </div>
      </div>

      {/* Form Alanları (Kayıt ve Bilgi) */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
        <h3 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wider">İletişim ve Hesap Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Ad Soyad" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.name} onChange={e => handleInputChange('name', e.target.value)} />
          <input type="tel" placeholder="Telefon Numarası" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.phone} onChange={e => handleInputChange('phone', e.target.value)} />
          
          <input type="email" placeholder="E-Posta Adresi" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
          <input type="password" placeholder="Hesap Şifresi Belirleyin" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.password || ''} onChange={e => handleInputChange('password', e.target.value)} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
        <h3 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wider">Kimlik ve Araç Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="TC / Pasaport No" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.tc} onChange={e => handleInputChange('tc', e.target.value)} />
          <input type="text" placeholder="Araç Plakası" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-green-600 text-gray-800 font-bold transition-colors" value={data.customer.plate} onChange={e => handleInputChange('plate', e.target.value)} />
        </div>
      </div>

      {/* Sözleşme Onayı */}
      <label className="flex items-start gap-3 mb-8 cursor-pointer bg-orange-50 p-4 rounded-xl border border-orange-100 transition-colors hover:bg-orange-100/50">
        <input type="checkbox" className="mt-1 w-5 h-5 accent-orange-500 rounded cursor-pointer" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
        <span className="text-sm text-gray-700 font-medium">
          Tesis kurallarını, iptal/iade koşullarını ve ortak alan kullanım yönergelerini <a href="#" className="underline text-orange-600 font-bold">okudum ve kabul ediyorum</a>.
        </span>
      </label>

      <div className="flex gap-4 mt-auto">
        <button onClick={onPrev} className="w-1/3 py-4 bg-gray-200 rounded-xl font-black text-gray-600 hover:bg-gray-300 transition-colors">Geri</button>
        <button 
          onClick={onComplete} 
          disabled={!isValid} 
          className="w-2/3 py-4 text-white rounded-xl font-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90" 
          style={{ backgroundColor: 'var(--color-brand-orange)' }}
        >
          Rezervasyonu Tamamla
        </button>
      </div>
    </motion.div>
  );
}