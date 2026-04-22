"use client";
import { motion } from "framer-motion";
import { ArrowRight, Waves, Tent, Truck, Coffee, Droplet, Flame, Users, Heart, Car, ShieldCheck, Video, Activity, Sparkles, MapPin } from "lucide-react";

export default function Step0Landing({ onStart }: { onStart: () => void }) {
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
      className="flex flex-col min-h-screen bg-gray-50 -mx-4 sm:-mx-6 -mt-6" // Container marginlerini sıfırlamak için
    >
      {/* HERO SECTION (GİRİŞ ALANI) */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-center p-6 overflow-hidden bg-gray-900">
        {/* Arka Plan Görseli */}
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
          
          {/* REZERVASYON BUTONU (1. Adıma Geçirir) */}
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-orange-500 text-white rounded-full font-black text-lg overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all hover:scale-105 hover:bg-orange-600 flex items-center gap-3"
          >
            Hemen Rezervasyon Yap
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={24} />
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

    </motion.div>
  );
}