"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Tent, Truck, CheckCircle2, Map } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

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
    // 🚀 AKILLI FİYAT FİLTRESİ: Sadece fiyatı 0'dan büyük olanları pakete dahil et
    const availablePackages = [];
    
    if (area.price_daily > 0) availablePackages.push({ id: "daily", name: "Günlük", price: area.price_daily, duration: "1 Gün" });
    if (area.price_3days > 0) availablePackages.push({ id: "3days", name: "3 Günlük", price: area.price_3days, duration: "3 Gün" });
    if (area.price_weekly > 0) availablePackages.push({ id: "weekly", name: "Haftalık", price: area.price_weekly, duration: "7 Gün" });
    if (area.price_monthly > 0) availablePackages.push({ id: "monthly", name: "Aylık", price: area.price_monthly, duration: "30 Gün" });
    if (area.price_6months > 0) availablePackages.push({ id: "6months", name: "6 Aylık", price: area.price_6months, duration: "180 Gün" });
    if (area.price_yearly > 0) availablePackages.push({ id: "yearly", name: "Yıllık", price: area.price_yearly, duration: "365 Gün" });

    const areaWithPackages = {
      ...area,
      packages: availablePackages
    };

    setData({ 
      ...data, 
      category: areaWithPackages,
      package: null // Yeni alan seçilince eski paketi sıfırla
    });
  };

  // 🚀 GRUPLAMA MANTIĞI: Alanları "Ana Kategoriye" göre ayır
  const groupedAreas = dbAreas.reduce((acc: any, area: any) => {
    const cat = area.main_category || "Diğer";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(area);
    return acc;
  }, {});

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-8">
      
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Konaklama Tipi</h2>
        <p className="text-gray-500 font-medium mt-2">Sistemde kayıtlı olan güncel alanlarımızdan seçim yapın.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* GRUPLANMIŞ KATEGORİLERİ EKRANA BAS */}
          {Object.keys(groupedAreas).map((mainCat) => (
            <div key={mainCat} className="bg-gray-50/80 p-4 sm:p-6 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                {mainCat === 'Karavan Kiralama' ? <Truck className="text-orange-500" /> : <Tent className="text-orange-500" />}
                {mainCat}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedAreas[mainCat].map((area: any) => {
                  const isSelected = data.category?.name === area.name;
                  const activeCapacity = area.capacity - (area.maintenance_count || 0);
                  const isFull = area.occupied >= activeCapacity;

                  return (
                    <div 
                      key={area.id}
                      onClick={() => !isFull && handleSelectCategory(area)}
                      className={`relative p-5 rounded-2xl border-4 transition-all duration-300 bg-white ${
                        isFull 
                          ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale-[50%]' 
                          : isSelected 
                            ? 'border-orange-500 shadow-md scale-[1.02] cursor-pointer' 
                            : 'border-transparent shadow-sm hover:border-orange-200 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1 shadow-lg z-10">
                          <CheckCircle2 size={24} />
                        </motion.div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl shrink-0 ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {mainCat === 'Karavan Kiralama' ? <Truck size={28} /> : <Map size={28} />}
                        </div>
                        <div>
                          <h4 className={`font-black text-lg leading-tight mb-1 ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{area.name}</h4>
                          <p className="text-xs font-bold text-gray-400">
                            Durum: <span className={isFull ? 'text-red-500' : 'text-green-600'}>
                              {isFull ? 'TAMAMEN DOLU' : `${area.occupied}/${activeCapacity} Dolu`}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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