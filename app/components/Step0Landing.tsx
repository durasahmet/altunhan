"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Waves, Tent, Truck, Coffee, Droplet, Flame, Users, Heart, Car, ShieldCheck, Video, Activity, Sparkles, MapPin, PhoneCall, CheckCircle2, X } from "lucide-react";
import { supabase } from "../../lib/supabase"; // 🚀 SUPABASE EKLENDİ

export default function Step0Landing({ onStart }: { onStart: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "Karavan Kiralama",
    guest_count: "2 Kişi"
  });

  // 🚀 GERÇEK BACKEND BAĞLANTISI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('contact_requests')
      .insert([{ ...formData, status: 'new' }]);

    setIsSubmitting(false);

    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setFormData({ name: "", phone: "", category: "Karavan Kiralama", guest_count: "2 Kişi" });
      }, 3000);
    } else {
      alert("Gönderim başarısız: " + error.message);
    }
  };

  const features = [
    { icon: Waves, text: "Denize ve Plajlara 200 Metre" },
    { icon: Tent, text: "Kamp & Çadır Alanları" },
    { icon: Truck, text: "Maxi ve Mini Karavan Alanları" },
    { icon: Coffee, text: "Büfe & Cafe" },
    { icon: Droplet, text: "Duş & WC Alanları" },
    { icon: Flame, text: "Barbekü Alanları" },
    { icon: Users, text: "Çocuk Parkları" },
    { icon: Heart, text: "İbadethane" },
    { icon: Car, text: "Otopark" },
    { icon: ShieldCheck, text: "7/24 Güvenlik" },
    { icon: Video, text: "7/24 Güvenlik Kamera Sistemi" },
    { icon: Activity, text: "Mini Futbol & Voleybol Alanı" },
  ];

  const upcomingFeatures = [
    "Aqua Park", "Basketbol Sahası", "Macera Parkı", "Kır Lokantası"
  ];

  return (
    <motion.div 
      key="landing" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex flex-col min-h-screen bg-gray-50 -mx-4 sm:-mx-6 -mt-6 relative" 
    >
      {/* HERO SECTION (GİRİŞ ALANI) */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-center p-6 overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: "url('/Render.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="relative z-10 max-w-3xl flex flex-col items-center mt-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 flex items-center gap-2">
            <MapPin size={16} className="text-orange-400" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">Enez, Edirne</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 drop-shadow-lg leading-tight">
            Doğanın Kalbinde <br />
            <span className="text-orange-500">Premium Kamp</span> Deneyimi
          </h1>
          <p className="text-lg text-gray-200 mb-10 font-medium max-w-xl">
            Denize sadece 200 metre mesafede, ailenizle huzur ve güven içinde vakit geçirebileceğiniz donanımlı çadır ve karavan alanları.
          </p>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-8 py-4 bg-orange-500 text-white rounded-full font-black text-lg overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all hover:scale-105 hover:bg-orange-600 flex items-center gap-3"
          >
            <PhoneCall size={24} /> Bizi Arayın, Yerinizi Ayıralım
          </button>
        </div>
      </div>

      {/* ÖZELLİKLER BÖLÜMÜ */}
      <div className="max-w-5xl mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-800" style={{ color: 'var(--color-brand-green)' }}>Tesis Özelliklerimiz</h2>
          <p className="text-gray-500 mt-2 font-medium">Konforunuz ve güvenliğiniz için her detayı düşündük.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="bg-orange-50 p-3 rounded-xl text-orange-500">
                <item.icon size={24} />
              </div>
              <span className="font-bold text-gray-700 text-sm">{item.text}</span>
            </motion.div>
          ))}
        </div>

        {/* 2027 VİZYONU */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-br from-green-800 to-green-900 rounded-[32px] p-8 text-white text-center relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Çok Yakında (2027)</span>
            <h3 className="text-2xl font-black mb-6">Tesisimiz Büyümeye Devam Ediyor!</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {upcomingFeatures.map((feat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl font-bold text-sm">
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* İLETİŞİM FORMU MODALI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {isSuccess ? (
                <div className="p-10 flex flex-col items-center text-center">
                  <CheckCircle2 size={64} className="text-green-500 mb-4" />
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Talebiniz Alındı!</h3>
                  <p className="text-gray-500 font-medium">Ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                      <PhoneCall className="text-orange-500" size={20} /> İletişim Formu
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adınız Soyadınız</label>
                      <input required type="text" placeholder="Örn: Ahmet Yılmaz" className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefon Numaranız</label>
                      <input required type="tel" placeholder="05XX XXX XX XX" className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İlgi Alanınız</label>
                        <select className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          <option>Karavan Kiralama</option>
                          <option>Çadır / Parsel Alanı</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kişi Sayısı</label>
                        <select className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800 bg-white" value={formData.guest_count} onChange={e => setFormData({...formData, guest_count: e.target.value})}>
                          <option>1 Kişi</option>
                          <option>2 Kişi</option>
                          <option>3 Kişi</option>
                          <option>4 Kişi</option>
                          <option>5+ Kişi</option>
                        </select>
                      </div>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full mt-4 py-4 bg-orange-500 text-white rounded-xl font-black text-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                      {isSubmitting ? "Gönderiliyor..." : "Beni Arayın"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}