"use client";
import { Users, Map as MapIcon, AlertCircle, TrendingUp, MapPin, ArrowDownToLine, ArrowUpFromLine, Clock, ShieldAlert, Tent, CalendarDays, ArrowRight, QrCode, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TabDashboard({ members, areas, pendingCount, setActiveTab }: any) {
  
  // 🚀 1. TARİH VE ZAMAN BAZLI GERÇEK METRİK HESAPLAMALARI
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkInsToday = 0;
  let checkOutsToday = 0;
  let currentlyActiveUnits = 0; // Dolu olan karavan/çadır sayısı
  let totalPeopleInside = 0;    // 🚀 YENİ: İçerideki toplam insan (nefes) sayısı
  let expiringSoonCount = 0; 
  let futureReservations = 0;

  const todaysMovements: any[] = [];
  const expiringMembers: any[] = [];

  members.forEach((m: any) => {
    if (!m.start_date || !m.end_date) return;
    
    const start = new Date(m.start_date); 
    start.setHours(0, 0, 0, 0);
    const end = new Date(m.end_date); 
    end.setHours(0, 0, 0, 0);

    if (start.getTime() === today.getTime()) {
      checkInsToday++;
      todaysMovements.push({ ...m, type: 'check-in' });
    }
    
    if (end.getTime() === today.getTime()) {
      checkOutsToday++;
      todaysMovements.push({ ...m, type: 'check-out' });
    }

    // EĞER MÜŞTERİ ŞU AN İÇERİDEYSE
    if (start <= today && end >= today) {
      currentlyActiveUnits++;
      
      // 🚀 KBS verisindeki kişi sayısını toplama ekle
      if (m.guests_data && Array.isArray(m.guests_data)) {
        totalPeopleInside += m.guests_data.length;
      } else {
        totalPeopleInside += 1; // Eski kayıtsa en az 1 kişi say
      }

      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 0 && diffDays <= 3) {
        expiringSoonCount++;
        expiringMembers.push({ ...m, daysLeft: diffDays });
      }
    }

    if (start > today) futureReservations++;
  });

  // 🚀 2. KAPASİTE VE ALAN HESAPLAMALARI
  const totalCapacity = areas.reduce((acc: number, area: any) => acc + (area.capacity || 0), 0);
  const totalMaintenance = areas.reduce((acc: number, area: any) => acc + (area.maintenance_count || 0), 0);
  const activeCapacity = totalCapacity - totalMaintenance;
  const occupancyRate = activeCapacity > 0 ? Math.round((currentlyActiveUnits / activeCapacity) * 100) : 0;

  const stats = [
    { title: "Tesis İçi Toplam Kişi", value: totalPeopleInside, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Dolu Ünite / Parsel", value: currentlyActiveUnits, icon: Tent, color: "text-green-600", bg: "bg-green-100" },
    { title: "Bugün Giriş Yapacaklar", value: checkInsToday, icon: ArrowDownToLine, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Bugün Çıkış Yapacaklar", value: checkOutsToday, icon: ArrowUpFromLine, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-orange-200 transition-colors"
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
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
        >
          <img src="/Render.jpg" alt="Tesis Haritası" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 text-white pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-500 p-1.5 rounded-lg"><MapPin size={16} /></span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">Altunhan Enez</span>
            </div>
            <h3 className="text-xl md:text-3xl font-black drop-shadow-lg">Canlı Tesis Görünümü</h3>
          </div>
        </motion.div>

        {/* SAĞ PANEL */}
        <div className="flex flex-col gap-4">
          {/* 🚀 HIZLI CHECK-IN BUTONU */}
          <button 
            onClick={() => setActiveTab && setActiveTab('gate')}
            className="w-full bg-gray-900 text-white p-5 rounded-3xl shadow-lg border border-gray-800 flex items-center justify-center gap-3 hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="bg-white/20 p-2 rounded-xl text-white">
              <QrCode size={24} />
            </div>
            <span className="text-lg font-black tracking-wide">Hızlı Check-in (QR)</span>
          </button>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col flex-1">
            <div className="p-5 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-black text-gray-800 text-lg">Durum Paneli</h3>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
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
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><Tent className="text-green-500" /> Bölge Bazlı Kapasite</h3>
            <span className="text-xs font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full">Genel Doluluk: %{occupancyRate}</span>
          </div>
          <div className="space-y-5">
            {areas.map((area: any) => {
              const cap = area.capacity - (area.maintenance_count || 0);
              const occ = area.occupied || 0;
              const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;
              const isDanger = pct > 90;
              const isWarning = pct > 75 && pct <= 90;

              return (
                <div key={area.id}>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span className="text-gray-700">{area.name}</span>
                    <span className="text-gray-500">{occ} / {cap}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`h-full ${isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-green-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 shrink-0"><Clock className="text-red-500" /> Yakında Çıkış Yapacaklar</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {expiringMembers.length > 0 ? (
              expiringMembers.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-red-50 transition-colors group">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{m.name}</p>
                    <p className="text-xs font-medium text-gray-500">{m.category}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded-md">{m.daysLeft} Gün Kaldı</span>
                    <button onClick={() => setActiveTab && setActiveTab('members')} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><ArrowRight size={16}/></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CheckCircle2 size={32} className="mb-2 text-green-200" />
                <p className="text-sm font-bold">Yakın zamanda çıkış yapacak yok.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><CalendarDays className="text-blue-500" /> Bugünün Operasyon Akışı</h3>
            <div className="flex gap-2">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{checkInsToday} Giriş</span>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{checkOutsToday} Çıkış</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-gray-400 bg-white border-b border-gray-100">
                  <th className="p-4 font-bold">İşlem Tipi</th>
                  <th className="p-4 font-bold">Hesap Sahibi / İletişim</th>
                  <th className="p-4 font-bold">Kişi Sayısı</th>
                  <th className="p-4 font-bold">Alan / Parsel</th>
                </tr>
              </thead>
              <tbody>
                {todaysMovements.length > 0 ? (
                  todaysMovements.map((m: any, idx: number) => {
                    const guestCount = m.guests_data ? m.guests_data.length : 1;
                    return (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          {m.type === 'check-in' 
                            ? <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded"><ArrowDownToLine size={14}/> GİRİŞ</span>
                            : <span className="inline-flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded"><ArrowUpFromLine size={14}/> ÇIKIŞ</span>
                          }
                        </td>
                        <td className="p-4 font-bold text-gray-800">{m.name} <br/><span className="text-xs font-medium text-gray-400">{m.phone}</span></td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md text-xs">{guestCount} Kişi</span>
                        </td>
                        <td className="p-4 font-bold text-gray-600">{m.category} <br/><span className="text-xs font-medium text-gray-400">Parsel: {m.parcel || '-'}</span></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Bugün için planlanmış bir giriş veya çıkış işlemi bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}