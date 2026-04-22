"use client";
import { Users, Map as MapIcon, AlertCircle, TrendingUp, MapPin, ArrowDownToLine, ArrowUpFromLine, Clock, ShieldAlert, Tent } from "lucide-react";
import { motion } from "framer-motion";

export default function TabDashboard({ members, areas, pendingCount }: any) {
  
  // 🚀 1. TARİH VE ZAMAN BAZLI GERÇEK METRİK HESAPLAMALARI
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkInsToday = 0;
  let checkOutsToday = 0;
  let currentlyActive = 0;
  let expiringSoon = 0; // 3 gün içinde çıkış yapacaklar
  let futureReservations = 0;

  // Tüm onaylı üyeleri tarayıp durumlarını güncel tarihe göre ayrıştırıyoruz
  members.forEach((m: any) => {
    if (!m.start_date || !m.end_date) return;
    
    const start = new Date(m.start_date); 
    start.setHours(0, 0, 0, 0);
    const end = new Date(m.end_date); 
    end.setHours(0, 0, 0, 0);

    // Bugün giriş yapacaklar
    if (start.getTime() === today.getTime()) checkInsToday++;
    
    // Bugün çıkış yapacaklar
    if (end.getTime() === today.getTime()) checkOutsToday++;

    // Şu an aktif olarak kampın içinde olanlar
    if (start <= today && end >= today) {
      currentlyActive++;
      
      // Süresi 3 günden az kalanları hesapla (bugün çıkacaklar hariç, onları yukarıda saydık)
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 0 && diffDays <= 3) expiringSoon++;
    }

    // İleri tarihli rezervasyonlar
    if (start > today) futureReservations++;
  });

  // 🚀 2. KAPASİTE VE ALAN HESAPLAMALARI
  const totalCapacity = areas.reduce((acc: number, area: any) => acc + (area.capacity || 0), 0);
  const totalMaintenance = areas.reduce((acc: number, area: any) => acc + (area.maintenance_count || 0), 0);
  
  // Gerçek kullanılabilir kapasite (Bakımdakiler düşülmüş)
  const activeCapacity = totalCapacity - totalMaintenance;
  
  // Anlık Doluluk Oranı
  const occupancyRate = activeCapacity > 0 ? Math.round((currentlyActive / activeCapacity) * 100) : 0;

  // Üst Kart Verileri
  const stats = [
    { title: "Şu Anki Misafir", value: currentlyActive, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Anlık Doluluk", value: `%${occupancyRate}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { title: "Bugün Gelecekler", value: checkInsToday, icon: ArrowDownToLine, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Bugün Çıkacaklar", value: checkOutsToday, icon: ArrowUpFromLine, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* 🚀 ÜST KARTLAR (DİNAMİK) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🚀 SOL BÖLÜM: Harita ve Doluluk Grafiği (Büyük Alan - 2 Kolon) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tesis Haritası Görseli */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative w-full h-48 md:h-72 rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
          >
            <img 
              src="/Render.jpg" 
              alt="Tesis Haritası" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500 p-1.5 rounded-lg"><MapPin size={16} /></span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">Altunhan Enez</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black drop-shadow-lg">Canlı Tesis Görünümü</h3>
            </div>
          </motion.div>

          {/* Dinamik Doluluk Grafiği */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Tent className="text-green-500" /> Aktif Kapasite Kullanımı
            </h3>
            <div className="relative h-6 md:h-8 w-full bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 75 ? 'bg-orange-400' : 'bg-green-500'}`}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs md:text-sm font-bold text-gray-500">
              <span>0</span>
              <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                Şu an içeride: {currentlyActive} Parsel Dolu
              </span>
              <span>{activeCapacity} (Tam Kapasite)</span>
            </div>
          </div>
        </div>

        {/* 🚀 SAĞ BÖLÜM: Operasyonel Uyarılar ve Görevler (1 Kolon) */}
        <div className="space-y-6">
          
          {/* Kritik Görevler Paneli */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-800 text-lg">Operasyon Paneli</h3>
            </div>
            
            <div className="p-2">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><AlertCircle size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Onay Bekleyenler</p>
                    <p className="text-xs font-medium text-gray-500">Ödeme kontrolü bekliyor</p>
                  </div>
                </div>
                <span className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-full">{pendingCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600"><Clock size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Süresi Yaklaşanlar</p>
                    <p className="text-xs font-medium text-gray-500">3 gün içinde çıkacaklar</p>
                  </div>
                </div>
                <span className="bg-red-500 text-white font-black text-sm px-3 py-1 rounded-full">{expiringSoon}</span>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><ShieldAlert size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">İleri Tarihli Kayıtlar</p>
                    <p className="text-xs font-medium text-gray-500">Gelecek rezervasyonlar</p>
                  </div>
                </div>
                <span className="bg-indigo-500 text-white font-black text-sm px-3 py-1 rounded-full">{futureReservations}</span>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-lg text-gray-600"><MapIcon size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Bakımdaki Parseller</p>
                    <p className="text-xs font-medium text-gray-500">Kullanıma kapalı alanlar</p>
                  </div>
                </div>
                <span className="bg-gray-600 text-white font-black text-sm px-3 py-1 rounded-full">{totalMaintenance}</span>
              </div>
            </div>
          </div>

          {/* Hızlı Duyuru Modülü */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 shadow-inner">
            <h4 className="font-black text-orange-800 mb-2 flex items-center gap-2">
              <AlertCircle size={18}/> Anlık Kamp Duyurusu
            </h4>
            <p className="text-xs font-bold text-orange-600 mb-4">Kamptaki <strong>{currentlyActive} aktif misafirin</strong> ekranına anlık bildirim gönderin.</p>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Örn: Akşam 20:00'de plaj voleybolu turnuvası!" className="w-full p-3 rounded-xl border border-orange-300 outline-none text-sm font-medium focus:border-orange-500" />
              <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-xl font-black text-sm hover:bg-orange-600 transition-colors shadow-md">
                Tesis Geneline Gönder
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}