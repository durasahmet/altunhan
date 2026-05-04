"use client";
import { LayoutDashboard, Users, Map, ScanLine, LogOut, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ activeTab, setActiveTab, pendingCount }: any) {
  const router = useRouter();

  return (
    <aside className="fixed bottom-0 left-0 w-full h-[72px] md:h-screen bg-white border-t md:border-t-0 md:border-r border-gray-200 flex flex-row md:flex-col z-50 md:sticky md:top-0 md:w-64 transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
      
      {/* Masaüstü Logo Kısmı (Mobilde Gizli) */}
      <div 
        className="hidden md:flex flex-col items-start p-6 border-b border-gray-100 shrink-0 cursor-pointer transition-transform hover:scale-[1.02]" 
        onClick={() => router.push("/")}
      >
        <img 
          src="/altunhan-logo.png" 
          alt="Altunhan Enez Logo" 
          className="h-24 w-auto object-contain mb-2" 
        />
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
          Yönetim Paneli
        </p>
      </div>
      
      {/* Navigasyon Linkleri (Mobilde yatay alt bar, Masaüstünde dikey) */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto">
        
        <button onClick={() => setActiveTab("dashboard")} className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === "dashboard" ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-50"}`}>
          <LayoutDashboard size={20} className="mb-0.5 md:mb-0" />
          <span className="text-[10px] md:text-sm">Metrikler</span>
        </button>

        {/* 🚀 YENİ EKLENEN: GELEN TALEPLER BUTONU */}
        <button onClick={() => setActiveTab("leads")} className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === "leads" ? "bg-orange-50 text-orange-700" : "text-gray-500 hover:bg-gray-50"}`}>
          <PhoneCall size={20} className="mb-0.5 md:mb-0" />
          <span className="text-[10px] md:text-sm">Talepler</span>
        </button>
        
        <button onClick={() => setActiveTab("members")} className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === "members" ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-50"}`}>
          <div className="relative">
            <Users size={20} className="mb-0.5 md:mb-0" />
            {/* Mobilde bildirim noktası ikonun sağ üstünde ping atar */}
            {pendingCount > 0 && (
              <span className="md:hidden absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-sm">Üyeler</span>
          {/* Masaüstünde bildirim rakamı sağda */}
          {pendingCount > 0 && <span className="hidden md:block ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>}
        </button>
        
        <button onClick={() => setActiveTab("areas")} className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === "areas" ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-50"}`}>
          <Map size={20} className="mb-0.5 md:mb-0" />
          <span className="text-[10px] md:text-sm">Alanlar</span>
        </button>
        
        <button onClick={() => setActiveTab("gate")} className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl font-bold transition-all flex-1 md:flex-none ${activeTab === "gate" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}>
          <ScanLine size={20} className="mb-0.5 md:mb-0" />
          <span className="text-[10px] md:text-sm">Kapı (QR)</span>
        </button>
      </nav>

      {/* Çıkış Butonu (Masaüstünde altta geniş, mobilde sağda dar) */}
      <div className="hidden md:block p-4 border-t border-gray-100 shrink-0">
        <button onClick={() => router.push("/")} className="w-full flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm">
          <LogOut size={18} /> Siteye Dön
        </button>
      </div>
      
      {/* Mobilde Siteye Dön Butonu */}
      <button onClick={() => router.push("/")} className="md:hidden flex flex-col items-center justify-center p-2 pr-4 rounded-xl text-gray-500 hover:text-red-600">
        <LogOut size={20} className="mb-0.5" />
        <span className="text-[10px] font-bold">Çıkış</span>
      </button>

    </aside>
  );
}