"use client";
import { useState } from "react";
import { AlertTriangle, Search, Check, X, User, Phone, MapPin, Calendar, CreditCard, ShieldCheck, Edit2, Clock, CalendarDays, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TabMembers({ pending, members, onApprove, onUpdateMember, onDeleteMember }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const openProfile = (member: any) => {
    setSelectedMember(member);
    setIsEditingPhone(false);
  };

  const savePhone = () => {
    const updated = { ...selectedMember, phone: tempPhone };
    setSelectedMember(updated);
    onUpdateMember(updated);
    setIsEditingPhone(false);
  };

  const handleExtend = () => {
    const daysStr = window.prompt(`${selectedMember.name} kişisinin süresi kaç gün uzatılacak?`, "30");
    if (!daysStr) return;
    
    const days = parseInt(daysStr, 10);
    if (!isNaN(days) && days > 0) {
      const updated = { 
        ...selectedMember, 
        remainingDays: selectedMember.remainingDays + days,
        totalDays: selectedMember.totalDays + days,
        total_days: (selectedMember.total_days || 0) + days 
      };
      setSelectedMember(updated);
      onUpdateMember(updated);
      alert(`Süre başarıyla ${days} gün uzatıldı!`);
    }
  };

  const handleCancel = () => {
    const msg = selectedMember.status === 'pending' 
      ? `${selectedMember.name} isimli kişinin rezervasyon talebini reddetmek istediğinize emin misiniz?`
      : `${selectedMember.name} isimli müşterinin üyeliğini iptal edip sistemden silmek istediğinize emin misiniz?`;

    if (window.confirm(msg)) {
      onDeleteMember(selectedMember.id);
      setSelectedMember(null);
    }
  };

  const calculateDays = (member: any) => {
    const total = parseInt(member.total_days || member.totalDays || 0, 10);
    let remaining = 0;
    let isFuture = false;

    if (member.end_date) {
      const endDate = new Date(member.end_date);
      const today = new Date();
      endDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (member.start_date) {
        const startDate = new Date(member.start_date);
        startDate.setHours(0, 0, 0, 0);
        if (today < startDate) {
          isFuture = true;
        }
      }

      if (isFuture) {
        remaining = total; 
      } else {
        const diffTime = endDate.getTime() - today.getTime();
        remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      if (remaining < 0) remaining = 0;
    } else {
      remaining = member.remainingDays || 0;
    }

    return { total, remaining, isFuture };
  };

  return (
    <div className="space-y-8">
      {/* ONAY BEKLEYENLER TABLOSU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500"/>
          <h2 className="font-bold text-orange-800">Onay Bekleyen Talepler ({pending.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-gray-400 bg-gray-50 border-b border-gray-100">
                <th className="p-4">Müşteri</th>
                <th className="p-4">Bölge / Parsel</th>
                <th className="p-4">Kişi Sayısı</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((req: any) => {
                const guestCount = req.guests_data ? req.guests_data.length : 1;
                return (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{req.name} <br/><span className="text-xs text-gray-400 font-normal">{req.phone}</span></td>
                    <td className="p-4"><span className="font-bold text-gray-700">{req.category}</span><br/><span className="text-xs text-gray-500">{req.parcel}</span></td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-md text-xs">{guestCount} Kişi</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openProfile(req)} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-600 transition-colors inline-flex items-center gap-2 shadow-sm">
                        İncele ve Onayla
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pending.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">Bekleyen talep yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* AKTİF ÜYELER TABLOSU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-gray-800">Aktif Müşteriler</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="İsim ara..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="p-4">Üye ID</th>
                <th className="p-4">Ad Soyad / Tel</th>
                <th className="p-4">Parsel</th>
                <th className="p-4">Tarihler</th>
                <th className="p-4">Kalan Süre Durumu</th>
                <th className="p-4 text-right sticky right-0 bg-gray-50 z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {members
                .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((rawMember: any) => {
                
                const { total, remaining, isFuture } = calculateDays(rawMember);
                const m = { ...rawMember, totalDays: total, remainingDays: remaining, isFuture };

                const percentLeft = (m.totalDays > 0) ? (m.remainingDays / m.totalDays) * 100 : 0;
                const isExpiringSoon = percentLeft <= 20 && !m.isFuture;

                return (
                  <tr key={m.id} className={`border-b border-gray-50 ${isExpiringSoon ? "bg-red-50" : "hover:bg-gray-50"} transition-colors`}>
                    <td className="p-4 font-mono text-gray-500">{m.id}</td>
                    <td className="p-4 font-bold text-gray-800">{m.name}<br/><span className="font-normal text-xs text-gray-500">{m.phone}</span></td>
                    <td className="p-4 font-bold">{m.parcel}</td>
                    <td className="p-4">
                      <div className="text-[11px] font-bold text-gray-800 border-b border-gray-100 pb-1 mb-1">
                        <span className="text-gray-400 mr-1">Giriş:</span> {formatDate(m.start_date)}
                      </div>
                      <div className="text-[11px] font-bold text-gray-800">
                        <span className="text-gray-400 mr-1">Çıkış:</span> {formatDate(m.end_date)}
                      </div>
                    </td>
                    <td className="p-4 w-1/4">
                      <div className="flex justify-between items-center text-xs mb-1 min-w-[150px]">
                        {m.isFuture ? (
                          <span className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                            <Clock size={12}/> Başlamadı ({m.totalDays} G)
                          </span>
                        ) : (
                          <span className={isExpiringSoon ? "text-red-600 font-bold" : "text-gray-500"}>{m.remainingDays} gün kaldı</span>
                        )}
                        
                        {isExpiringSoon && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={12}/></span>}
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${m.isFuture ? "bg-blue-400" : isExpiringSoon ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${percentLeft}%` }}></div>
                      </div>
                    </td>
                    <td className="p-4 text-right sticky right-0 z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] bg-inherit">
                        <button 
                          onClick={() => openProfile(m)}
                          className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
                        >
                          Profili Gör
                        </button>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">Kayıtlı aktif müşteri bulunmuyor.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAĞDAN AÇILAN MÜŞTERİ PROFİL / ONAY ÇEKMECESİ */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black bg-opacity-40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200"
            >
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={20} />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {selectedMember.status === 'pending' ? 'Talebi İncele' : 'Müşteri Detayı'}
                  </h2>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white shadow-sm border border-gray-200">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* TEPEDEKİ DURUM KARTI */}
                <div className={`rounded-2xl p-6 text-white shadow-md relative overflow-hidden ${
                    selectedMember.status === 'pending' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    selectedMember.isFuture ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'
                  }`}>
                  <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldCheck size={80} /></div>
                  <p className="text-white/80 text-xs font-bold tracking-widest uppercase mb-1">Üye ID: {selectedMember.id}</p>
                  <h3 className="text-2xl font-black mb-1 relative z-10">{selectedMember.name}</h3>
                  <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm mt-2">
                    {selectedMember.status === 'pending' ? <AlertTriangle size={14} /> : selectedMember.isFuture ? <Clock size={14} /> : <Check size={14} />} 
                    {selectedMember.status === 'pending' ? "Onay Bekliyor" : selectedMember.isFuture ? "İleri Tarihli Kayıt" : "Aktif Üyelik"}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* KİMLİK BİLDİRİM (KBS) LİSTESİ */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={16} /></div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">KBS Misafir Listesi</p>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-100">
                        {selectedMember.guests_data ? selectedMember.guests_data.length : 0} Kişi
                      </span>
                    </div>
                    
                    {selectedMember.guests_data && selectedMember.guests_data.length > 0 ? (
                      <div className="space-y-2">
                        {selectedMember.guests_data.map((g: any, i: number) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-blue-50 flex justify-between items-center shadow-sm">
                             <div>
                               <p className="text-sm font-bold text-gray-800">{g.name}</p>
                               <p className="text-xs font-medium text-gray-500">TC: {g.tc}</p>
                             </div>
                             <span className="text-[10px] font-black px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">{g.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                        <AlertTriangle size={16} /> KBS Bilgileri Girilmemiş! Onaylanamaz.
                      </div>
                    )}
                  </div>

                  {/* İLETİŞİM BİLGİLERİ */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-gray-200 p-3 rounded-lg text-gray-600"><Phone size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">Telefon Numarası</p>
                      {isEditingPhone ? (
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            className="flex-1 border-2 border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-green-500 w-full" 
                            value={tempPhone} 
                            onChange={(e) => setTempPhone(e.target.value)}
                            autoFocus
                          />
                          <button onClick={savePhone} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold shrink-0">Kaydet</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm font-bold text-gray-800">{selectedMember.phone}</p>
                          {selectedMember.status === 'approved' && (
                            <button onClick={() => { setIsEditingPhone(true); setTempPhone(selectedMember.phone); }} className="text-gray-400 hover:text-blue-600 transition-colors p-2">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TARİH VE KONAKLAMA BİLGİLERİ */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600"><CalendarDays size={20} /></div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Giriş Tarihi</p>
                        <p className="text-sm font-black text-indigo-900">{formatDate(selectedMember.start_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Çıkış Tarihi</p>
                        <p className="text-sm font-black text-indigo-900">{formatDate(selectedMember.end_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1 text-orange-600"><MapPin size={16} /><p className="text-xs font-bold text-gray-400 uppercase">Alan / Parsel</p></div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{selectedMember.category}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{selectedMember.parcel}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1 text-green-600"><CreditCard size={16} /><p className="text-xs font-bold text-gray-400 uppercase">Tutar</p></div>
                      <p className="text-sm font-black text-gray-800">{selectedMember.amount}</p>
                    </div>
                  </div>

                  {selectedMember.status === 'approved' && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Clock size={20} /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Kullanım Süresi ({selectedMember.isFuture ? "Başlamadı" : "Kalan"})</p>
                          <p className={`text-lg font-black ${!selectedMember.isFuture && selectedMember.remainingDays <= (selectedMember.totalDays * 0.2) ? 'text-red-500' : 'text-gray-800'}`}>
                            {selectedMember.remainingDays} Gün
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedMember.isFuture ? "bg-blue-400" : (selectedMember.totalDays > 0 && selectedMember.remainingDays <= (selectedMember.totalDays * 0.2)) ? "bg-red-500" : "bg-green-500"}`} 
                          style={{ width: `${(selectedMember.totalDays > 0) ? (selectedMember.remainingDays / selectedMember.totalDays) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs text-gray-400 font-bold mt-2">Toplam: {selectedMember.totalDays} Gün</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ALT AKSİYON BUTONLARI (Duruma göre değişir) */}
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 pb-8 sm:pb-6">
                {selectedMember.status === 'pending' ? (
                  <>
                    <button onClick={handleCancel} className="py-4 sm:py-3 rounded-xl font-black text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100">
                      Talebi Reddet
                    </button>
                    <button 
                      onClick={() => {
                        if (!selectedMember.guests_data || selectedMember.guests_data.length === 0) {
                          alert("KBS (Misafir) bilgileri eksik olan kayıtlar yasal olarak onaylanamaz!");
                          return;
                        }
                        onApprove(selectedMember);
                        setSelectedMember(null);
                      }} 
                      className="py-4 sm:py-3 rounded-xl font-black text-sm bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Check size={18}/> Kaydı Onayla
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCancel} className="py-4 sm:py-3 rounded-xl font-black text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100">
                      Üyeliği İptal Et
                    </button>
                    <button onClick={handleExtend} className="py-4 sm:py-3 rounded-xl font-black text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-md">
                      Süreyi Uzat
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}