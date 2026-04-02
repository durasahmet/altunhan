"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Tent, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase"; // Supabase bağlantısı

export default function Step1Category({ data, setData, onNext, slideVariants }: any) {
  const [dbAreas, setDbAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa açıldığında Admin panelindeki "Aktif" alanları getir
  useEffect(() => {
    const fetchAreas = async () => {
      const { data: areasData } = await supabase.from('areas').select('*').eq('status', 'active').order('id');
      if (areasData) {
        setDbAreas(areasData);
      }
      setIsLoading(false);
    };
    fetchAreas();
  }, []);

  const handleSelectCategory = (area: any) => {
    // Veritabanındaki price_ sütunlarını Step2Date'in beklediği formata sokuyoruz
    const areaWithPackages = {
      ...area,
      packages: [
        { id: "yearly", name: "Yıllık", price: area.price_yearly || 0, duration: "365 Gün" },
        { id: "monthly", name: "Aylık", price: area.price_monthly || 0, duration: "30 Gün" },
        { id: "weekly", name: "Haftalık", price: area.price_weekly || 0, duration: "7 Gün" },
        { id: "daily", name: "Günlük", price: area.price_daily || 0, duration: "1 Gün" }
      ]
    };

    setData({ 
      ...data, 
      category: areaWithPackages,
      package: null 
    });
  };

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-6">
      
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Konaklama Tipi</h2>
        <p className="text-gray-500 font-medium mt-2">Sistemde kayıtlı olan güncel alanlarımızdan seçim yapın.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dbAreas.map((area) => {
            const isSelected = data.category?.name === area.name;
            // İsminde karavan geçiyorsa Karavan ikonu, geçmiyorsa Çadır ikonu kullan
            const Icon = area.name.toLowerCase().includes("karavan") ? Truck : Tent;

            return (
              <div 
                key={area.id}
                onClick={() => handleSelectCategory(area)}
                className={`relative p-6 rounded-3xl border-4 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle2 size={24} />
                  </motion.div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={32} />
                  </div>
                  <div>
                    <h3 className={`font-black text-lg ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{area.name}</h3>
                    <p className="text-sm font-bold text-gray-400 mt-1">Kapasite: {area.occupied}/{area.capacity} Dolu</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          onClick={onNext} 
          disabled={!data.category}
          className="w-full sm:w-auto px-12 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: 'var(--color-brand-green)' }}
        >
          Tarih Seçimine Geç <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}