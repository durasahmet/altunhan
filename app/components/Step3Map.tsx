"use client";
import { useState, useEffect } from "react";
import { MapPin, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase"; // Klasör yolu düzeltildi

export default function Step3Map({ data, setData, onNext, onPrev, slideVariants }: any) {
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoading(true);
      const { data: areasData } = await supabase.from('areas').select('*').eq('status', 'active'); 

      if (areasData) {
        // 1. Adımda seçilen kategoriye (alana) göre filtreleme yapıyoruz!
        const filteredAreas = areasData.filter((a: any) => a.name === data.category?.name);
        setAreas(filteredAreas);
        
        // Madem sadece 1 tane alan gözükecek, onu otomatik olarak seçili hale getirelim ki müşteri uğraşmasın
        if (filteredAreas.length > 0) {
          setSelectedArea(filteredAreas[0]);
          // Ana dataya da hemen parcel bilgisini işleyelim
          setData((prev: any) => ({ ...prev, parcel: filteredAreas[0].name }));
        }
      }
      setIsLoading(false);
    };

    fetchAreas();
  }, [data.category]);

  const handleNext = () => {
    if (selectedArea) {
      onNext();
    }
  };

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Seçtiğin Alanın Konumu</h2>
        <p className="text-gray-500 font-medium mt-2">1. adımda seçtiğin bölgenin haritadaki yeri onayını bekliyor.</p>
      </div>

      {isLoading ? (
        <div className="w-full aspect-video bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-gray-200">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gray-100 rounded-3xl border-4 border-gray-200 overflow-hidden shadow-inner group pointer-events-none">
          {/* Arka Plan Harita Görseli (Tıklamayı kapattık, sadece görsün) */}
          <img 
            src="/Render.jpg" 
            alt="Tesis Haritası" 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
          />
          
          {/* SADECE FİLTRELENEN (SEÇİLEN) PİNLER GÖZÜKECEK */}
          {areas.map((area: any) => (
            <motion.div
              key={area.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: area.map_top, left: area.map_left }}
            >
              <div className="relative">
                <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
                </span>
                <MapPin size={48} className="drop-shadow-2xl text-orange-500" style={{ fill: '#fff' }} />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md bg-orange-500 text-white">
                {area.name}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedArea && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-orange-500" size={24} />
            <div>
              <p className="text-sm font-bold text-orange-900">Haritada Gösterilen Bölge</p>
              <p className="text-lg font-black text-orange-700">{selectedArea.name}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-4 pt-4">
        <button onClick={onPrev} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} /> Geri
        </button>
        <button 
          onClick={handleNext} 
          disabled={!selectedArea}
          className="flex-1 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
          style={{ backgroundColor: 'var(--color-brand-green)' }}
        >
          Onayla ve Devam Et <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}