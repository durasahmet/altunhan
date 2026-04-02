"use client";
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Step2Date({ data, setData, onNext, onPrev, slideVariants }: any) {

  // Çıkış Tarihi Hesaplama Fonksiyonu
  const calculateEndDate = () => {
    if (!data.startDate || !data.package) return "Hesaplanıyor...";
    
    const start = new Date(data.startDate);
    
    // HAYAT KURTARAN KOD: "30 Gün" metninin içindeki sadece rakamları (30) alır!
    const days = parseInt(data.package.duration.replace(/\D/g, ''), 10) || 0; 
    
    // Bitiş tarihini hesapla (Gün sayısını milisaniyeye çevirip ekliyoruz)
    const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Tarihi güzel bir Türkçe formatında yazdır (Örn: 2 Mayıs 2026)
    return end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePackageSelect = (pkg: any) => {
    setData({ ...data, package: pkg });
  };

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-8">
      
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Tarih ve Süre</h2>
        <p className="text-gray-500 font-medium mt-2">Konaklamaya ne zaman başlayacaksınız ve ne kadar kalacaksınız?</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
        
        {/* BAŞLANGIÇ TARİHİ SEÇİMİ */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Calendar className="text-orange-500" size={18} /> Başlangıç Tarihi
          </label>
          <input 
            type="date" 
            className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold bg-white shadow-sm"
            value={data.startDate}
            onChange={(e) => setData({ ...data, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]} // Geçmiş tarihlerin seçilmesini engeller
          />
        </div>

        {/* PAKET SEÇİMİ */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Clock className="text-orange-500" size={18} /> Konaklama Süresi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.category?.packages?.map((pkg: any) => {
              const isSelected = data.package?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-orange-500">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <p className={`font-black ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{pkg.name}</p>
                  <p className="text-xs font-bold text-gray-400 mt-1">{pkg.duration}</p>
                  <p className="text-sm font-bold text-green-600 mt-2">{pkg.price.toLocaleString('tr-TR')} ₺</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* BİTİŞ TARİHİ ÖZETİ (Sadece seçim yapıldıysa görünür) */}
        {data.startDate && data.package && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-100 border border-orange-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase">Çıkış Tarihiniz</p>
              <p className="text-lg font-black text-orange-900">{calculateEndDate()}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm">
               <Calendar className="text-orange-500" size={24} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onPrev} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} /> Geri
        </button>
        <button 
          onClick={onNext} 
          disabled={!data.startDate || !data.package}
          className="flex-1 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: 'var(--color-brand-green)' }}
        >
          Haritaya Geç <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}