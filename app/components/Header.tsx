"use client";
import { useState } from "react";
import { UserCircle, X, ArrowRight, Lock, User } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; 
import { supabase } from "../../lib/supabase";

export default function Header({ isLoggedIn, userType, onLoginSuccess }: any) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin Kontrolü
    if (email === "admin@altunhan.com" && password === "123456") {
      if (onLoginSuccess) onLoginSuccess("admin");
      localStorage.setItem('isAdmin', 'true');
      setIsLoginOpen(false); 
      router.push("/admin"); 
      return;
    } 
    
    // MÜŞTERİ VERİTABANI KONTROLÜ
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (data) {
      localStorage.setItem('customerId', data.id);
      if (onLoginSuccess) onLoginSuccess("customer");
      setIsLoginOpen(false);
      router.push("/profile");
    } else {
      alert("Hata: E-Posta veya Şifre yanlış!");
    }
  };

  return (
    <>
      <header className="w-full bg-white border-b-4 border-gray-200 py-4 px-6 sm:px-12 flex justify-between items-center shadow-sm sticky top-0 z-50">
        
        {/* LOGO KISMI GÜNCELLENDİ */}
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <img 
            src="/altunhan-logo.png" 
            alt="Altunhan Enez Logo" 
            className="h-24 w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>
        
        {isLoggedIn ? (
          <button 
            onClick={() => router.push(userType === "admin" ? "/admin" : "/profile")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 border-green-700 text-green-800 bg-green-50 hover:bg-green-100"
          >
            <User size={20} />
            <span className="hidden sm:inline">{userType === "admin" ? "Yönetim Paneli" : "Profilim"}</span>
          </button>
        ) : (
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-700 bg-gray-50 hover:bg-orange-50"
          >
            <UserCircle size={20} />
            <span className="hidden sm:inline">Giriş Yap</span>
          </button>
        )}
      </header>

      {/* GİRİŞ YAP KUTUSU (MODAL) */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Lock className="text-gray-400" size={20} />
                  <h2 className="text-xl font-bold text-gray-800">Sisteme Giriş</h2>
                </div>
                <button onClick={() => setIsLoginOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">E-Posta Adresi</label>
                  <input 
                    type="email" 
                    required
                    className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 transition-colors text-gray-800"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Şifre</label>
                  <input 
                    type="password" 
                    required
                    className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 transition-colors text-gray-800"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: 'var(--color-brand-green)' }}
                >
                  Giriş Yap <ArrowRight size={20} />
                </button>
                
                <p className="mt-4 text-center text-xs text-gray-400">
                  Şifrenizi unuttuysanız tesis yönetimiyle iletişime geçin.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}