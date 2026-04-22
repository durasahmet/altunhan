"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import QRCode from "react-qr-code";
import { User, MapPin, Calendar, ShieldAlert, CheckCircle2, LogOut, Clock, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const customerId = localStorage.getItem('customerId');
      if (!customerId) {
        router.push('/'); 
        return;
      }

      const { data, error } = await supabase.from('reservations').select('*').eq('id', customerId).single();
      if (data) {
        setUser(data);
        // Kalan Gün Hesaplama
        if (data.end_date) {
            const end = new Date(data.end_date);
            const today = new Date();
            end.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            setRemainingDays(diff > 0 ? diff : 0);
        }
      } else {
        localStorage.removeItem('customerId');
        router.push('/');
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    router.push('/');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* ÜST BAR */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
           <img src="/altunhan-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
          <LogOut size={16}/> <span className="hidden sm:inline">Güvenli Çıkış</span>
        </button>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-20 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* SOL: QR KOD VE KALAN GÜN */}
          <div className="md:col-span-1">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <h2 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Dijital Giriş Kartı</h2>
              
              <div className={`bg-white p-3 sm:p-4 rounded-2xl inline-block border-4 shadow-inner mb-4 ${user.status === 'approved' ? 'border-green-50' : 'border-orange-50 opacity-20 grayscale'}`}>
                <QRCode value={user.id} size={150} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
              
              <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-gray-800">{user.id}</p>
              
              {/* Kalan Gün Bilgisi */}
              {user.status === 'approved' && (
                <div className="mt-4 py-2 px-4 bg-blue-50 rounded-full inline-flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <Clock size={16} /> {remainingDays} Gün Kaldı
                </div>
              )}

              <div className={`mt-6 p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold text-sm ${user.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                {user.status === 'approved' ? <><CheckCircle2 size={24}/> <span>Giriş Yetkisi Aktif</span></> : <><ShieldAlert size={24}/> <span>Onay Bekleniyor</span></>}
              </div>
            </motion.div>
          </div>

          {/* SAĞ: DETAY BİLGİLERİ */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                 <h2 className="text-xl sm:text-2xl font-black text-gray-800">Rezervasyon Detayı</h2>
                 <a 
                    href="https://wa.me/905407472222" 
                    target="_blank" 
                    className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                 >
                    <MessageCircle size={16} /> Destek Al
                 </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"><User size={14}/> Misafir</div>
                  <p className="text-base sm:text-lg font-black text-gray-800">{user.name}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">{user.phone}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"><MapPin size={14}/> Konaklama Alanı</div>
                  <p className="text-base sm:text-lg font-black text-orange-600">{user.category}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded-md">Parsel: {user.parcel}</span>
                    <span className="text-xs font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded-md">Plaka: {user.plate || '-'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3"><Calendar size={14}/> Konaklama Süresi</div>
                  <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -z-10"></div>
                    
                    <div className="bg-white px-3 py-2 rounded-xl border border-blue-100 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Giriş</p>
                      <p className="font-black text-blue-700 text-sm sm:text-base">{new Date(user.start_date).toLocaleDateString('tr-TR')}</p>
                    </div>
                    
                    <div className="bg-blue-600 text-white text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full shadow-md z-10">
                      {user.total_days} GÜN
                    </div>

                    <div className="bg-white px-3 py-2 rounded-xl border border-blue-100 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Çıkış</p>
                      <p className="font-black text-red-600 text-sm sm:text-base">{new Date(user.end_date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {user.status === 'pending' && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-orange-50 border border-orange-200 p-5 rounded-[24px] flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <ShieldAlert className="text-orange-500 flex-shrink-0" size={32}/>
                <div>
                  <h3 className="font-black text-orange-800 mb-1">Rezervasyonunuz Onay Bekliyor</h3>
                  <p className="text-sm font-medium text-orange-700">Ödemeniz teyit edildikten sonra dijital geçiş kartınız otomatik olarak aktifleşecektir. Destek için sağ üstteki butonu kullanabilirsiniz.</p>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}