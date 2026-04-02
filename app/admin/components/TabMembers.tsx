"use client";
import { useState } from "react";
import { AlertTriangle, Search, Check, X, User, Phone, MapPin, Calendar, CreditCard, ShieldCheck, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TabMembers({ pending, members, onApprove, onUpdateMember, onDeleteMember }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  // Telefon Düzenleme State'leri
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState("");

  const openProfile = (member: any) => {
    setSelectedMember(member);
    setIsEditingPhone(false); // Profil açılırken düzenleme modu kapalı başlasın
  };

  // TELEFON KAYDET
  const savePhone = () => {
    const updated = { ...selectedMember, phone: tempPhone };
    setSelectedMember(updated);
    onUpdateMember(updated);
    setIsEditingPhone(false);
  };

  // SÜREYİ UZAT
  const handleExtend = () => {
    const daysStr = window.prompt(`${selectedMember.name} kişisinin süresi kaç gün uzatılacak?`, "30");
    if (!daysStr) return;
    
    const days = parseInt(daysStr, 10);
    if (!isNaN(days) && days > 0) {
      const updated = { 
        ...selectedMember, 
        remainingDays: selectedMember.remainingDays + days,
        totalDays: selectedMember.totalDays + days
      };
      setSelectedMember(updated);
      onUpdateMember(updated);
      alert(`Süre başarıyla ${days} gün uzatıldı!`);
    }
  };

  // ÜYELİĞİ İPTAL ET
  const handleCancel = () => {
    if (window.confirm(`${selectedMember.name} isimli müşterinin üyeliğini iptal edip sistemden silmek istediğinize emin misiniz?`)) {
      onDeleteMember(selectedMember.id);
      setSelectedMember(null); // Çekmeceyi kapat
    }
  };

  return (
    <div className="space-y-8">
      {/* ONAY BEKLEYENLER TABLOSU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500"/>
          <h2 className="font-bold text-orange-800">Onay Bekleyen Yeni Talepler ({pending.length})</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 bg-gray-50 border-b border-gray-100">
              <th className="p-4">Müşteri</th>
              <th className="p-4">Parsel</th>
              <th className="p-4">Tutar</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((req: any) => (
              <tr key={req.id} className="border-b border-gray-50">
                <td className="p-4 font-bold text-gray-800">{req.name} <br/><span className="text-xs text-gray-400 font-normal">{req.phone}</span></td>
                <td className="p-4">{req.parcel}</td>
                <td className="p-4 font-bold text-orange-600">{req.amount}</td>
                <td className="p-4 text-right">
                  <button onClick={() => onApprove(req)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition-colors inline-flex items-center gap-2">
                    <Check size={16}/> Onayla (QR Oluştur)
                  </button>
                </td>
              </tr>
            ))}
            {pending.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">Bekleyen talep yok.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* AKTİF ÜYELER TABLOSU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Aktif Müşteriler</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="İsim ara..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="p-4">Üye ID</th>
              <th className="p-4">Ad Soyad / Tel</th>
              <th className="p-4">Parsel</th>
              <th className="p-4">Kalan Süre Durumu</th>
              <th className="p-4 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {members
              .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((m: any) => {
              const percentLeft = (m.totalDays > 0) ? (m.remainingDays / m.totalDays) * 100 : 0;
              const isExpiringSoon = percentLeft <= 20;

              return (
                <tr key={m.id} className={`border-b border-gray-50 ${isExpiringSoon ? "bg-red-50" : "hover:bg-gray-50"} transition-colors`}>
                  <td className="p-4 font-mono text-gray-500">{m.id}</td>
                  <td className="p-4 font-bold text-gray-800">{m.name}<br/><span className="font-normal text-xs text-gray-500">{m.phone}</span></td>
                  <td className="p-4 font-bold">{m.parcel}</td>
                  <td className="p-4 w-1/3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isExpiringSoon ? "text-red-600 font-bold" : "text-gray-500"}>{m.remainingDays} gün kaldı</span>
                      {isExpiringSoon && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={12}/> Yenileme Yaklaştı</span>}
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${isExpiringSoon ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${percentLeft}%` }}></div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                      <button 
                        onClick={() => openProfile(m)}
                        className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        Profili Gör
                      </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SAĞDAN AÇILAN MÜŞTERİ PROFİL ÇEKMECESİ (SLIDE-OVER) */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black bg-opacity-40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={20} />
                  <h2 className="text-xl font-bold text-gray-800">Müşteri Detayı</h2>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldCheck size={80} /></div>
                  <p className="text-green-100 text-xs font-bold tracking-widest uppercase mb-1">Üye Numarası: {selectedMember.id}</p>
                  <h3 className="text-2xl font-black mb-1 relative z-10">{selectedMember.name}</h3>
                  <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm mt-2">
                    <Check size={14} /> Aktif Üyelik
                  </div>
                </div>

                <div className="space-y-4">
                  {/* TELEFON BİLGİSİ (DÜZENLENEBİLİR) */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Phone size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">Telefon Numarası</p>
                      {isEditingPhone ? (
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            className="flex-1 border-2 border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-blue-500" 
                            value={tempPhone} 
                            onChange={(e) => setTempPhone(e.target.value)}
                            autoFocus
                          />
                          <button onClick={savePhone} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold">Kaydet</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm font-bold text-gray-800">{selectedMember.phone}</p>
                          <button onClick={() => { setIsEditingPhone(true); setTempPhone(selectedMember.phone); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><MapPin size={20} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Rezerve Edilen Parsel</p>
                      <p className="text-sm font-bold text-gray-800">{selectedMember.parcel}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600"><CreditCard size={20} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Ödenen Tutar</p>
                      <p className="text-sm font-bold text-gray-800">{selectedMember.amount}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Calendar size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Kalan Kullanım Süresi</p>
                        <p className={`text-lg font-black ${selectedMember.remainingDays <= (selectedMember.totalDays * 0.2) ? 'text-red-500' : 'text-gray-800'}`}>
                          {selectedMember.remainingDays} Gün
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${selectedMember.totalDays > 0 && selectedMember.remainingDays <= (selectedMember.totalDays * 0.2) ? "bg-red-500" : "bg-green-500"}`} 
                        style={{ width: `${(selectedMember.totalDays > 0) ? (selectedMember.remainingDays / selectedMember.totalDays) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-gray-400 font-bold mt-2">Toplam: {selectedMember.totalDays} Gün</p>
                  </div>
                </div>
              </div>

              {/* ALT AKSİYON BUTONLARI */}
              <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
                <button onClick={handleCancel} className="py-3 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  Üyeliği İptal Et
                </button>
                <button onClick={handleExtend} className="py-3 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md">
                  Süreyi Uzat
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}