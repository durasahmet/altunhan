"use client";
import { useState } from "react";
import { Phone, User, Users, CheckCircle2, AlertCircle, Clock, Trash2, Link as LinkIcon, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function TabLeads({ requests, onUpdateStatus, onDeleteReq }: any) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const newRequests = requests.filter((r: any) => r.status === 'new');
  const contactedRequests = requests.filter((r: any) => r.status === 'contacted');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleCopyLink = (id: number) => {
    // Bulunulan sitenin adresini otomatik alır ve sonuna parametreyi ekler
    const link = `${window.location.origin}/?rezervasyon=1`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      
      {/* SOL KOLON: YENİ GELEN TALEPLER */}
      <div className="bg-orange-50/50 rounded-3xl border border-orange-100 p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-xl font-black text-orange-900 flex items-center gap-2">
            <AlertCircle className="text-orange-500" /> Yeni Talepler
          </h2>
          <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-full text-sm">{newRequests.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {newRequests.length === 0 ? (
            <p className="text-center text-orange-400 font-bold py-10">Bekleyen yeni talep yok.</p>
          ) : (
            newRequests.map((req: any) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg flex items-center gap-2"><User size={18} className="text-gray-400"/> {req.name}</h3>
                    <p className="font-bold text-gray-500 flex items-center gap-2 mt-1"><Phone size={16} className="text-blue-500"/> {req.phone}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock size={12}/> {formatDate(req.created_at)}</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{req.category}</span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><Users size={12}/> {req.guest_count}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onUpdateStatus(req.id, 'contacted')} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 size={16}/> Görüşüldü İşaretle
                  </button>
                  <button onClick={() => { if(window.confirm('Silmek istediğinize emin misiniz?')) onDeleteReq(req.id) }} className="px-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* SAĞ KOLON: GÖRÜŞÜLENLER (ARANANLAR) */}
      <div className="bg-green-50/50 rounded-3xl border border-green-100 p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-xl font-black text-green-900 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" /> Arananlar
          </h2>
          <span className="bg-green-500 text-white font-black px-3 py-1 rounded-full text-sm">{contactedRequests.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 opacity-90">
          {contactedRequests.length === 0 ? (
            <p className="text-center text-green-400 font-bold py-10">Henüz görüşülen kimse yok.</p>
          ) : (
            contactedRequests.map((req: any) => (
              <motion.div key={req.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">{req.name}</h3>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Görüşüldü</span>
                </div>
                <p className="text-sm font-medium text-gray-500">{req.phone} • {req.category}</p>
                
                {/* 🚀 LİNK KOPYALAMA VE AKSİYON ALANI */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleCopyLink(req.id)} 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copiedId === req.id ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    {copiedId === req.id ? <Check size={14}/> : <LinkIcon size={14}/>}
                    {copiedId === req.id ? "Kopyalandı!" : "Rezervasyon Linkini Kopyala"}
                  </button>

                  <div className="flex items-center gap-3">
                    <button onClick={() => onUpdateStatus(req.id, 'new')} className="text-xs font-bold text-orange-500 hover:underline">Geri Al</button>
                    <button onClick={() => { if(window.confirm('Silmek istediğinize emin misiniz?')) onDeleteReq(req.id) }} className="text-xs font-bold text-red-400 hover:text-red-600">Sil</button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}