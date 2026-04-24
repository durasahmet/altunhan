"use client";
import { useState, useEffect } from "react";
import { Plus, Settings, X, MapPin, Save, Wrench, CreditCard, Tag, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";

export default function TabAreas({ areas }: any) {
  const [areaList, setAreaList] = useState<any[]>([]);
  
  useEffect(() => {
    if (areas) {
      setAreaList(areas.map((a: any) => ({
        ...a,
        mapPos: { top: a.map_top || "50%", left: a.map_left || "50%" },
        maintenanceCount: a.maintenance_count || 0,
        main_category: a.main_category || "Karavan Kiralama",
        person_capacity: a.person_capacity || "Standart", // 🚀 YENİ EKLENDİ
        price_daily: a.price_daily || 0,
        price_3days: a.price_3days || 0,
        price_weekly: a.price_weekly || 0,
        price_monthly: a.price_monthly || 0,
        price_6months: a.price_6months || 0,
        price_yearly: a.price_yearly || 0,
      })));
    }
  }, [areas]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [currentArea, setCurrentArea] = useState<any>({
    id: null, name: "", capacity: "", occupied: 0, status: "active", maintenanceCount: 0, 
    main_category: "Karavan Kiralama", 
    person_capacity: "Standart", // 🚀 YENİ EKLENDİ
    price_daily: 0, price_3days: 0, price_weekly: 0, price_monthly: 0, price_6months: 0, price_yearly: 0, 
    mapPos: { top: "50%", left: "50%" }
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentArea({ ...currentArea, mapPos: { top: `${y}%`, left: `${x}%` } });
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentArea({ 
      id: null, name: "", capacity: "", occupied: 0, status: "active", maintenanceCount: 0, 
      main_category: "Karavan Kiralama",
      person_capacity: "Standart",
      price_daily: 0, price_3days: 0, price_weekly: 0, price_monthly: 0, price_6months: 0, price_yearly: 0, 
      mapPos: { top: "50%", left: "50%" } 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (area: any) => {
    setEditMode(true);
    setCurrentArea(area);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: currentArea.name,
      main_category: currentArea.main_category,
      person_capacity: currentArea.person_capacity, // 🚀 YENİ EKLENDİ
      capacity: parseInt(currentArea.capacity) || 0,
      price_daily: parseInt(currentArea.price_daily) || 0,
      price_3days: parseInt(currentArea.price_3days) || 0,
      price_weekly: parseInt(currentArea.price_weekly) || 0,
      price_monthly: parseInt(currentArea.price_monthly) || 0,
      price_6months: parseInt(currentArea.price_6months) || 0,
      price_yearly: parseInt(currentArea.price_yearly) || 0,
      map_top: currentArea.mapPos.top,
      map_left: currentArea.mapPos.left
    };

    if (editMode) {
      const { error } = await supabase.from('areas').update(payload).eq('id', currentArea.id);
      if (!error) {
        setAreaList(areaList.map((a: any) => a.id === currentArea.id ? { ...currentArea, ...payload } : a));
      } else alert("Hata: " + error.message);
    } else {
      const { data, error } = await supabase.from('areas').insert([{ 
        ...payload, 
        occupied: 0, 
        maintenance_count: 0, 
        status: 'active' 
      }]).select();

      if (data && !error) {
        setAreaList([...areaList, { ...data[0], mapPos: currentArea.mapPos, maintenanceCount: 0 }]);
      } else alert("Hata: " + error.message);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu alanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    const { error } = await supabase.from('areas').delete().eq('id', id);
    if (!error) {
      setAreaList(areaList.filter(a => a.id !== id));
    } else {
      alert("Silinirken hata oluştu: " + error.message);
    }
  };

  const handleMaintenance = async (area: any) => {
    const input = window.prompt(`${area.name} için bakıma alınacak parsel sayısını girin (Bakımı bitirmek için 0 yazın):`, area.maintenanceCount || "0");
    if (input === null) return;
    
    const count = parseInt(input, 10);
    if (isNaN(count) || count < 0 || count > area.capacity) {
      alert("Lütfen geçerli bir sayı giriniz. Kapasiteyi aşamazsınız.");
      return;
    }

    const newStatus = count > 0 ? 'maintenance' : 'active';
    const { error } = await supabase.from('areas').update({ maintenance_count: count, status: newStatus }).eq('id', area.id);

    if (!error) {
      setAreaList(areaList.map((a: any) => a.id === area.id ? { ...a, maintenanceCount: count, status: newStatus } : a));
    } else alert("Bakım güncellenirken hata oluştu.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tesis Alanları ve Fiyat Yönetimi</h2>
        <button onClick={handleAddNew} className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-900 shadow-lg transition-colors border border-gray-700">
          <Plus size={18}/> Yeni Ünite Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {areaList.map((area: any) => {
          const activeCapacity = area.capacity - (area.maintenanceCount || 0);

          return (
            <div key={area.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all hover:border-orange-200">
              
              <div className="w-full lg:w-auto flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Tag size={10} /> {area.main_category}
                  </span>
                  {/* 🚀 LİSTEDE KİŞİ KAPASİTESİ GÖSTERİMİ */}
                  {area.person_capacity && area.person_capacity !== "Standart" && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                      <Users size={10} /> {area.person_capacity}
                    </span>
                  )}
                  <h3 className="font-black text-xl text-gray-800">{area.name}</h3>
                  {area.maintenanceCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                      <Wrench size={12}/> {area.maintenanceCount} Parsel Bakımda
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mb-2">Kullanılabilir Kapasite: <span className="font-bold text-gray-800">{area.occupied} / {activeCapacity}</span> Dolu</p>
                <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${activeCapacity > 0 ? (area.occupied / activeCapacity) * 100 : 0}%` }}></div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  {area.price_daily > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> Gün: {area.price_daily}₺</span>}
                  {area.price_3days > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> 3 Gün: {area.price_3days}₺</span>}
                  {area.price_weekly > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> Hafta: {area.price_weekly}₺</span>}
                  {area.price_monthly > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> Ay: {area.price_monthly}₺</span>}
                  {area.price_6months > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> 6 Ay: {area.price_6months}₺</span>}
                  {area.price_yearly > 0 && <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CreditCard size={12}/> Yıl: {area.price_yearly}₺</span>}
                </div>
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto">
                <button onClick={() => handleEdit(area)} className="flex-1 lg:flex-none px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <Settings size={18}/> Düzenle
                </button>
                <button 
                  onClick={() => handleMaintenance(area)}
                  className={`flex-1 lg:flex-none px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${area.maintenanceCount > 0 ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}
                >
                  <Wrench size={18}/> {area.maintenanceCount > 0 ? 'Bakımı Güncelle' : 'Bakıma Al'}
                </button>
                <button 
                  onClick={() => handleDelete(area.id)}
                  className="flex-1 lg:flex-none px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100"
                >
                  <X size={18}/> Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden my-8 border border-white/20">
              
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Settings className="text-orange-500" size={24}/> {editMode ? "Üniteyi Düzenle" : "Yeni Ünite Oluştur"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* 1. Kategori, Ad, Kapasite ve KİŞİ SEÇENEĞİ */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ana Başlık</label>
                    <select 
                      className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors appearance-none bg-white"
                      value={currentArea.main_category} 
                      onChange={e => setCurrentArea({...currentArea, main_category: e.target.value})}
                    >
                      <option value="Karavan Kiralama">Karavan Kiralama</option>
                      <option value="Alan Kiralama">Alan Kiralama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ünite Adı</label>
                    <input type="text" placeholder="Örn: Maxi Karavan" className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors" value={currentArea.name} onChange={e => setCurrentArea({...currentArea, name: e.target.value})} />
                  </div>
                  {/* 🚀 YENİ KİŞİ KAPASİTESİ SEÇİCİSİ */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Users size={12}/> Kişi Sayısı</label>
                    <select 
                      className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors appearance-none bg-white"
                      value={currentArea.person_capacity} 
                      onChange={e => setCurrentArea({...currentArea, person_capacity: e.target.value})}
                    >
                      <option value="Standart">Standart / Çadır</option>
                      <option value="2 Kişilik">2 Kişilik</option>
                      <option value="4 Kişilik">4 Kişilik</option>
                      <option value="6 Kişilik">6 Kişilik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stok (Adet)</label>
                    <input type="number" placeholder="Örn: 50" className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors" value={currentArea.capacity} onChange={e => setCurrentArea({...currentArea, capacity: e.target.value})} />
                  </div>
                </div>

                {/* 2. Dinamik Fiyatlandırma Tablosu */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14}/> Fiyat Listesi (₺)</label>
                    <span className="text-[10px] text-gray-400 font-bold">* Sunmak istemediğiniz paketleri 0 bırakın.</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                    {[
                      { label: "Günlük", key: "price_daily" },
                      { label: "3 Günlük", key: "price_3days" },
                      { label: "Haftalık", key: "price_weekly" },
                      { label: "Aylık", key: "price_monthly" },
                      { label: "6 Aylık", key: "price_6months" },
                      { label: "Yıllık", key: "price_yearly" }
                    ].map((priceItem) => (
                      <div key={priceItem.key} className="space-y-1">
                        <label className="text-[10px] font-bold text-green-700 uppercase">{priceItem.label}</label>
                        <input 
                          type="number" 
                          min="0"
                          className="w-full p-3 rounded-xl border border-white shadow-sm font-bold text-gray-800 outline-none focus:border-green-500 bg-white" 
                          value={currentArea[priceItem.key]} 
                          onChange={e => setCurrentArea({...currentArea, [priceItem.key]: e.target.value})} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. İnteraktif Harita */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={16}/> Harita Konumu</label>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-gray-100 cursor-crosshair group shadow-inner" onClick={handleMapClick}>
                    <img src="/Render.jpg" alt="Harita" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300" style={{ top: currentArea.mapPos.top, left: currentArea.mapPos.left }}>
                      <div className="relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <MapPin size={48} className="drop-shadow-2xl text-orange-500 relative z-10" style={{ fill: '#fff' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Kaydet Butonu */}
                <button onClick={handleSave} className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30">
                  <Save size={24} /> Tüm Değişiklikleri Kaydet
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}