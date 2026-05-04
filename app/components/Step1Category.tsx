"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Tent, Truck, CheckCircle2, Map, Users } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function Step1Category({ data, setData, onNext, slideVariants }: any) {
  const [dbVariants, setDbVariants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 KİŞİ SAYISI FİLTRESİ İÇİN STATE
  const [guestCount, setGuestCount] = useState<number>(2);

  useEffect(() => {
    const fetchVariants = async () => {
      const { data: variantsData, error } = await supabase.from('available_variants').select('*');
      if (variantsData) {
        setDbVariants(variantsData);
      } else {
        console.error("Veritabanı hatası:", error);
      }
      setIsLoading(false);
    };
    fetchVariants();
  }, []);

  const handleSelectCategory = (areaGroup: any) => {
    setData({ 
      ...data, 
      categoryGroup: areaGroup.name,
      allOptions: areaGroup.allVariations, 
      category: areaGroup.allVariations[0], // Step 2 dinamik olarak asıl uygun olanı seçecek
      package: null 
    });
  };

  const getStartingPrice = (variations: any[]) => {
    const allPrices: number[] = [];
    variations.forEach(v => {
      const prices = [v.price_daily, v.price_3days, v.price_weekly, v.price_monthly, v.price_6months, v.price_yearly].filter(p => p > 0);
      allPrices.push(...prices);
    });
    return allPrices.length > 0 ? Math.min(...allPrices) : 0;
  };

  const getCapacityFromColumn = (personCapStr: string) => {
    if (!personCapStr || personCapStr.includes("Standart")) return 99; 
    const match = personCapStr.match(/(\d+)/); 
    return match ? parseInt(match[1]) : 99; 
  };

  // 1. Seçilen kişi sayısına yetmeyen kapasiteleri gizle
  const filteredVariants = dbVariants.filter(v => {
    const itemCapacity = getCapacityFromColumn(v.person_capacity);
    return itemCapacity >= guestCount; 
  });

  // 🚀 TYPESCRIPT FIX: Record<string, any> eklendi
  const groupedByName = filteredVariants.reduce((acc: Record<string, any>, variant: any) => {
    const name = variant.area_name;
    if (!acc[name]) {
      acc[name] = {
        id: variant.area_id,
        name: name,
        main_category: variant.main_category,
        allVariations: []
      };
    }
    acc[name].allVariations.push(variant);
    return acc;
  }, {} as Record<string, any>);

  const uniqueAreas = Object.values(groupedByName);

  // 🚀 TYPESCRIPT FIX: Record<string, any> eklendi
  const finalGroups = uniqueAreas.reduce((acc: Record<string, any>, areaGroup: any) => {
    const cat = areaGroup.main_category || "Diğer";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(areaGroup);
    return acc;
  }, {} as Record<string, any>);

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-8">
      
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Konaklama Tipi</h2>
        <p className="text-gray-500 font-medium mt-2">Kişi sayısını seçin, size en uygun alanları listeleyelim.</p>
      </div>

      {/* KİŞİ SAYISI SEÇİCİ (FİLTRE) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-center">
        <div className="flex items-center gap-2 text-gray-500 font-bold">
          <Users size={20} className="text-orange-500" />
          <span>Kaç Kişi Konaklayacaksınız?</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <button
              key={num}
              onClick={() => setGuestCount(num)}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg font-black text-sm transition-all ${
                guestCount === num 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {num}{num === 6 ? '+' : ''}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {Object.keys(finalGroups).length === 0 && (
            <div className="bg-orange-50 p-6 rounded-2xl text-center border border-orange-100">
              <p className="font-bold text-orange-800">Seçtiğiniz kişi sayısına uygun bir ünite bulunamadı.</p>
              <p className="text-sm text-orange-600 mt-1">Lütfen kişi sayısını azaltarak tekrar deneyin.</p>
            </div>
          )}

          {/* GRUPLANMIŞ KATEGORİLER */}
          {Object.keys(finalGroups).map((mainCat) => (
            <div key={mainCat} className="bg-gray-50/80 p-4 sm:p-6 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                {mainCat === 'Karavan Kiralama' ? <Truck className="text-orange-500" /> : <Tent className="text-orange-500" />}
                {mainCat} Seçenekleri
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finalGroups[mainCat].map((areaGroup: any) => {
                  const isSelected = data.categoryGroup === areaGroup.name;
                  
                  const activeGroupCapacity = areaGroup.allVariations.reduce((sum: number, v: any) => sum + (v.capacity - (v.maintenance_count || 0)), 0);
                  const startingPrice = getStartingPrice(areaGroup.allVariations);

                  return (
                    <div 
                      key={areaGroup.id}
                      onClick={() => handleSelectCategory(areaGroup)}
                      className={`relative p-5 rounded-2xl border-4 transition-all duration-300 bg-white cursor-pointer ${
                        isSelected 
                          ? 'border-orange-500 shadow-md scale-[1.02]' 
                          : 'border-transparent shadow-sm hover:border-orange-200 hover:shadow-md'
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
                          <h4 className={`font-black text-lg leading-tight mb-2 ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{areaGroup.name}</h4>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md tracking-wide">
                              {mainCat === 'Karavan Kiralama' ? 'ÜRÜN' : 'ALAN'} KAPASİTESİ: {activeGroupCapacity}
                            </span>
                            {startingPrice > 0 && (
                              <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-md tracking-wide">
                                BAŞLANGIÇ: {startingPrice.toLocaleString('tr-TR')} ₺
                              </span>
                            )}
                          </div>

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
          disabled={!data.categoryGroup}
          className="w-full sm:w-auto px-12 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: 'var(--color-brand-green)' }}
        >
          Tarih Seçimine Geç <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}