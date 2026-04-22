"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import Step0Landing from "./components/Step0Landing";
import Step1Category from "./components/Step1Category";
import Step2Date from "./components/Step2Date";
import Step3Map from "./components/Step3Map";
import Step4UserInfo from "./components/Step4UserInfo";
import Step5Success from "./components/Step5Success";

// SUPABASE BAĞLANTISI
import { supabase } from "../lib/supabase";

export default function Home() {
  const [step, setStep] = useState(0); 
  const [reservationCode, setReservationCode] = useState("");
  
  const [authState, setAuthState] = useState<{ isLoggedIn: boolean; userType: string | null }>({
    isLoggedIn: false,
    userType: null 
  });

  const [data, setData] = useState<any>({
    category: null,
    package: null,
    startDate: "",
    parcel: "",
    customer: { name: "", phone: "", tc: "", plate: "", email: "", password: "" } 
  });

  const handleLoginSuccess = (type: string) => {
    setAuthState({ isLoggedIn: true, userType: type });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleCompleteOrder = async () => {
    const code = "M-" + Math.floor(100000 + Math.random() * 900000).toString();
    setReservationCode(code);

    const start = new Date(data.startDate);
    const days = parseInt(String(data.package?.duration).replace(/\D/g, ''), 10) || 0;
    const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));

    const { error } = await supabase
      .from('reservations')
      .insert([
        {
          id: code,
          name: data.customer.name,
          phone: data.customer.phone,
          email: data.customer.email,
          password: data.customer.password,
          tc: data.customer.tc,
          plate: data.customer.plate,
          category: data.category?.name || 'Belirtilmedi',
          parcel: data.parcel,
          amount: data.package?.price ? `${data.package.price.toLocaleString('tr-TR')} ₺` : 'Belirtilmedi',
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
          total_days: days,
          status: 'pending'
        }
      ]);

    if (error) {
      alert("Rezervasyon kaydedilemedi: " + error.message);
      return; 
    }

    localStorage.setItem('customerId', code);
    setAuthState({ isLoggedIn: true, userType: "customer" }); 
    nextStep(); 
  };

  const slideVariants = {
    hiddenRight: { x: 50, opacity: 0 },
    hiddenLeft: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Header 
        isLoggedIn={authState.isLoggedIn} 
        userType={authState.userType} 
        onLoginSuccess={handleLoginSuccess} 
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        
        <AnimatePresence mode="wait">
          {/* ADIM 0: LANDING PAGE */}
          {step === 0 && (
            <Step0Landing onStart={() => setStep(1)} />
          )}

          {/* ADIM 1 VE SONRASI: REZERVASYON AKIŞI */}
          {step > 0 && (
            <motion.div 
              key="reservation-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden relative min-h-[550px] sm:min-h-[600px] flex flex-col my-4 sm:my-8" 
              style={{ border: '4px solid var(--color-brand-sand)' }}
            >
              {/* Progress Bar sadece rezervasyon adımlarında görünür */}
              <ProgressBar step={step} />
              
              <div className="p-4 sm:p-8 md:p-10 flex-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                  {step === 1 && <Step1Category data={data} setData={setData} onNext={nextStep} slideVariants={slideVariants} />}
                  {step === 2 && <Step2Date data={data} setData={setData} onNext={nextStep} onPrev={prevStep} slideVariants={slideVariants} />}
                  {step === 3 && <Step3Map data={data} setData={setData} onNext={nextStep} onPrev={prevStep} slideVariants={slideVariants} />}
                  {step === 4 && <Step4UserInfo data={data} setData={setData} onPrev={prevStep} onComplete={handleCompleteOrder} slideVariants={slideVariants} />}
                  {step === 5 && <Step5Success data={data} reservationCode={reservationCode} slideVariants={slideVariants} />}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}