"use client";
import { Users, Map as MapIcon, AlertCircle, TrendingUp, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function TabDashboard({ members, areas, pendingCount }: any) {
  
  // GERÇEK METRİK HESAPLAMALARI
  const totalMembers = members.length;
  const totalCapacity = areas.reduce((acc: number, area: any) => acc + (area.capacity || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalMembers / totalCapacity) * 100) : 0;
  
  // Bakımdaki toplam parsel sayısı
  const totalMaintenance = areas.reduce((acc: number, area: any) => acc + (area.maintenance_count || 0), 0);

  const stats = [
    { title: "Aktif Misafir", value: totalMembers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Doluluk Oranı", value: `%${occupancyRate}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { title: "Bekleyen Onay", value: pendingCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Bakımdaki Alan", value: totalMaintenance, icon: MapIcon, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Üst Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🚀 TESİS HARİTASI (YENİ EKLENEN GÖRSEL BÖLÜM) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative w-full h-56 md:h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
      >
        <img 
          src="/Render.jpg" 
          alt="Tesis Haritası" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Şık bir karartma efekti ve metin */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500 p-1.5 rounded-lg"><MapPin size={18} /></span>
            <span className="text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">Altunhan Enez</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black drop-shadow-lg">Tesis Genel Görünümü</h3>
        </div>
      </motion.div>

      {/* Görsel Doluluk Grafiği */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Genel Tesis Doluluk Durumu</h3>
        <div className="relative h-8 w-full bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${occupancyRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${occupancyRate > 90 ? 'bg-red-500' : 'bg-green-500'}`}
          />
        </div>
        <div className="flex justify-between mt-4 text-sm font-bold text-gray-500">
          <span>0 (Boş)</span>
          <span className="text-gray-800">Şu anki Doluluk: {totalMembers} / {totalCapacity} Parsel</span>
          <span>{totalCapacity} (Tam Dolu)</span>
        </div>
      </div>

      {/* Hızlı Aksiyonlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h4 className="font-bold text-orange-800 mb-2">Hızlı Duyuru Geç</h4>
          <p className="text-sm text-orange-600 mb-4">Tüm aktif misafirlerin (karekod ekranına) anlık bildirim gönderin.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Örn: Akşam 20:00'de canlı müzik var!" className="flex-1 p-3 rounded-lg border border-orange-200 outline-none text-sm" />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Gönder</button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">Sistem Özeti</h4>
          <p className="text-sm text-blue-600 mb-4">Şu an toplam <strong>{totalMembers}</strong> aktif üye sistemde kayıtlı. Bunlardan <strong>{members.filter((m: any) => m.remainingDays < 5).length}</strong> tanesinin üyeliği 5 günden az sürede bitecek.</p>
          <button className="text-blue-700 font-bold text-sm underline">Bitmek üzere olanları listele</button>
        </div>
      </div>
    </div>
  );
}