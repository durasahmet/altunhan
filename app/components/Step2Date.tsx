"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2, AlertTriangle, Loader2, Users, Info } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase"; 

export default function Step2Date({ data, setData, onNext, onPrev, slideVariants }: any) {
  
  const [isChecking, setIsChecking] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [availableSpots, setAvailableSpots] = useState<number | null>(null);

  const isFixedCapacityArea = data.categoryGroup?.toLowerCase().includes("alan") || false;

  const absoluteMaxCapacity = data.allOptions?.reduce((max: number, opt: any) => {
    const cap = parseInt(opt.person_capacity?.match(/\d+/)?.[0] || "99");
    return cap > max ? cap : max;
  }, 0) || 99;

  useEffect(() => {
    if (!data.allOptions || data.allOptions.length === 0) return;

    let matchedVariant;
    
    if (isFixedCapacityArea) {
       matchedVariant = data.allOptions[0]; 
       if (data.guests?.adults !== 2) {
           setData((prev: any) => ({ ...prev, guests: { adults: 2, children: 0 } }));
       }
    } else {
        const currentAdults = data.guests?.adults || 1;
        const currentChildren = data.guests?.children || 0;
        const totalGuests = currentAdults + currentChildren;

        const sortedOptions = [...data.allOptions].sort((a, b) => {
          const capA = parseInt(a.person_capacity?.match(/\d+/)?.[0] || "99");
          const capB = parseInt(b.person_capacity?.match(/\d+/)?.[0] || "99");
          return capA - capB;
        });

        matchedVariant = sortedOptions.find(opt => {
          const cap = parseInt(opt.person_capacity?.match(/\d+/)?.[0] || "99");
          return cap >= totalGuests;
        }) || sortedOptions[sortedOptions.length - 1]; 
    }

    // 🚀 BÜTÜN FİYATLAR ARTIK VERİTABANINDAN (PANELDEN) DİNAMİK GELİYOR
    const m = matchedVariant;
    const availablePackages = [];
    
    if (m.price_daily > 0) availablePackages.push({ id: "daily", name: "1 Günlük", price: m.price_daily, duration: "1 Gün" });
    if (m.price_2days > 0) availablePackages.push({ id: "2days", name: "2 Günlük", price: m.price_2days, duration: "2 Gün" });
    if (m.price_3days > 0) availablePackages.push({ id: "3days", name: "3 Günlük", price: m.price_3days, duration: "3 Gün" });
    if (m.price_4days > 0) availablePackages.push({ id: "4days", name: "4 Günlük", price: m.price_4days, duration: "4 Gün" });
    if (m.price_5days > 0) availablePackages.push({ id: "5days", name: "5 Günlük", price: m.price_5days, duration: "5 Gün" });
    if (m.price_6days > 0) availablePackages.push({ id: "6days", name: "6 Günlük", price: m.price_6days, duration: "6 Gün" });
    if (m.price_weekly > 0) availablePackages.push({ id: "weekly", name: "7 Günlük (Haftalık)", price: m.price_weekly, duration: "7 Gün" });
    if (m.price_8days > 0) availablePackages.push({ id: "8days", name: "8 Günlük", price: m.price_8days, duration: "8 Gün" });
    if (m.price_9days > 0) availablePackages.push({ id: "9days", name: "9 Günlük", price: m.price_9days, duration: "9 Gün" });
    if (m.price_10days > 0) availablePackages.push({ id: "10days", name: "10 Günlük", price: m.price_10days, duration: "10 Gün" });
    if (m.price_monthly > 0) availablePackages.push({ id: "monthly", name: "Aylık", price: m.price_monthly, duration: "30 Gün" });
    if (m.price_6months > 0) availablePackages.push({ id: "6months", name: "6 Aylık", price: m.price_6months, duration: "180 Gün" });
    
    // 🚀 YILLIK İÇİN "FİYAT ALINIZ" MANTIĞI
    const isKaravanKiralama = data.categoryGroup?.toLowerCase().includes("karavan") && 
                              (data.categoryGroup?.toLowerCase().includes("kiralama") || data.categoryGroup?.toLowerCase().includes("lüks") || data.categoryGroup?.toLowerCase().includes("lux"));
    
    if (isKaravanKiralama) {
      availablePackages.push({ id: "yearly", name: "Yıllık", price: 0, displayPrice: "Fiyat Alınız", duration: "365 Gün" });
    } else if (m.price_yearly > 0) {
      availablePackages.push({ id: "yearly", name: "Yıllık", price: m.price_yearly, duration: "365 Gün" });
    }

    const isVariantChanged = data.category?.id !== matchedVariant.id;
    const arePackagesMissing = data.category?.packages === undefined;

    if (isVariantChanged || arePackagesMissing) {
       setData({
         ...data,
         category: { ...matchedVariant, packages: availablePackages },
         package: isVariantChanged ? null : data.package 
       });
    }
  }, [data.guests, data.allOptions, data.categoryGroup, isFixedCapacityArea]);

  const calculateEndDate = () => {
    if (!data.startDate || !data.package) return null;
    const start = new Date(data.startDate);
    const days = parseInt(data.package.duration.replace(/\D/g, ''), 10) || 0; 
    const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));
    return end;
  };

  const formattedEndDate = () => {
    const end = calculateEndDate();
    if (!end) return "Hesaplanıyor...";
    return end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePackageSelect = (pkg: any) => {
    setData({ ...data, package: pkg });
  };

  const updateGuests = (type: 'adults' | 'children', operation: 'plus' | 'minus') => {
    if (isFixedCapacityArea) return; 

    const currentAdults = data.guests?.adults || 1;
    const currentChildren = data.guests?.children || 0;
    
    let newAdults = currentAdults;
    let newChildren = currentChildren;

    if (type === 'adults') {
      if (operation === 'plus') newAdults++;
      if (operation === 'minus' && newAdults > 1) newAdults--;
    } else {
      if (operation === 'plus') newChildren++;
      if (operation === 'minus' && newChildren > 0) newChildren--;
    }

    const totalGuests = newAdults + newChildren;

    if (totalGuests > absoluteMaxCapacity) {
      alert(`Seçtiğiniz ${data.categoryGroup} kategorisi maksimum ${absoluteMaxCapacity} kişi kapasitelidir.`);
      return;
    }

    setData({ ...data, guests: { adults: newAdults, children: newChildren } });
  };

  useEffect(() => {
    const checkAvailability = async () => {
      if (!data.startDate || !data.package || !data.category) {
        setIsFull(false);
        setAvailableSpots(null);
        return;
      }

      setIsChecking(true);
      setIsFull(false);

      const targetVariantId = data.category.id;
      const totalCapacity = data.category.capacity - (data.category.maintenance_count || 0);

      const reqStart = new Date(data.startDate);
      const reqEnd = calculateEndDate();
      
      if (!reqEnd) {
        setIsChecking(false);
        return;
      }

      reqStart.setHours(0,0,0,0);
      reqEnd.setHours(0,0,0,0);

      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('area_variant_id', targetVariantId)
        .eq('status', 'approved'); 

      if (error) {
        console.error("Kapasite kontrol hatası:", error);
        setIsChecking(false);
        return;
      }

      let overlappingCount = 0;
      if (existingReservations) {
        existingReservations.forEach((res) => {
           const resStart = new Date(res.start_date);
           const resEnd = new Date(res.end_date);
           resStart.setHours(0,0,0,0);
           resEnd.setHours(0,0,0,0);

           if (reqStart < resEnd && reqEnd > resStart) {
              overlappingCount++;
           }
        });
      }

      const emptySpots = totalCapacity - overlappingCount;
      setAvailableSpots(emptySpots);

      if (emptySpots <= 0) setIsFull(true);
      else setIsFull(false);

      setIsChecking(false);
    };

    checkAvailability();
  }, [data.startDate, data.package, data.category]); 

  const availablePackages = data.category?.packages || [];

  return (
    <motion.div variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="space-y-8">
      
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-brand-green)' }}>Tarih ve Süre</h2>
        <p className="text-gray-500 font-medium mt-2">{data.categoryGroup} için detaylarınızı belirleyin.</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
        
        {/* KİŞİ SAYISI SEÇİMİ VEYA SABİT BİLGİ */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Users className="text-orange-500" size={18} /> Konaklayacak Kişiler
          </label>
          
          {isFixedCapacityArea ? (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 shadow-sm">
               <div className="flex items-start gap-3">
                 <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                 <div>
                    <h4 className="font-black text-blue-900 mb-1">Standart Parsel Kapasitesi</h4>
                    <p className="text-sm font-medium text-blue-800">Seçtiğiniz <strong>{data.categoryGroup}</strong> için standart kullanım kapasitesi maksimum <span className="font-black underline">2 Yetişkin ve 3 Çocuk</span> olarak belirlenmiştir.</p>
                    <p className="text-xs font-bold text-blue-600 mt-2 bg-white/50 inline-block px-2 py-1 rounded">Daha kalabalık gruplar veya detaylar için lütfen bizimle iletişime geçin.</p>
                 </div>
               </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Yetişkin</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => updateGuests('adults', 'minus')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-gray-200">-</button>
                    <span className="font-black text-lg w-4 text-center">{data.guests?.adults || 1}</span>
                    <button onClick={() => updateGuests('adults', 'plus')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-gray-200">+</button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Çocuk</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => updateGuests('children', 'minus')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-gray-200">-</button>
                    <span className="font-black text-lg w-4 text-center">{data.guests?.children || 0}</span>
                    <button onClick={() => updateGuests('children', 'plus')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-gray-200">+</button>
                  </div>
                </div>
              </div>
              
              {data.category && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="text-blue-500 shrink-0" size={16} />
                  <p className="text-xs font-bold text-blue-800">
                    Kişi sayınıza en uygun ünite eşleştirildi: <span className="font-black underline">{data.category.name} ({data.category.person_capacity})</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* BAŞLANGIÇ TARİHİ SEÇİMİ VE SAATLER */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Calendar className="text-orange-500" size={18} /> Başlangıç Tarihi
          </label>
          <input 
            type="date" 
            className="w-full p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold bg-white shadow-sm transition-colors"
            value={data.startDate}
            onChange={(e) => setData({ ...data, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]} 
          />
          {/* 🚀 GİRİŞ ÇIKIŞ SAATLERİ (Eklendi) */}
          <div className="flex gap-4 mt-3 text-xs font-black text-gray-500">
            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1"><Clock size={12} className="text-green-500"/> Giriş: 12:00</span>
            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1"><Clock size={12} className="text-red-500"/> Çıkış: 10:00</span>
          </div>
        </div>

        {/* PAKET SEÇİMİ VE DİNAMİK FİYATLAR */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Clock className="text-orange-500" size={18} /> Konaklama Süresi ve Fiyat
          </label>
          
          {availablePackages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availablePackages.map((pkg: any) => {
                const isSelected = data.package?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-orange-500">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <p className={`font-black text-sm ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{pkg.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{pkg.duration}</p>
                    
                    {/* 🚀 FİYAT GÖSTERİMİ: "Fiyat Alınız" desteği eklendi */}
                    <p className="text-sm font-black text-green-600 mt-2">
                      {pkg.displayPrice ? pkg.displayPrice : `${pkg.price.toLocaleString('tr-TR')} ₺`}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-center gap-3">
              <AlertTriangle className="text-orange-500" size={24} />
              <p className="text-sm font-bold text-orange-800">Bu alan için henüz bir fiyat paketi tanımlanmamış. Lütfen Admin Panelden ekleyin.</p>
            </div>
          )}
        </div>

        {/* AKILLI KOTA KONTROL VE BİTİŞ TARİHİ BÖLÜMÜ */}
        {data.startDate && data.package && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* Yıllık fiyat alınız seçilmediyse çıkış tarihini göster */}
            {data.package.id !== 'yearly' && (
              <div className="bg-orange-100 border border-orange-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase">Çıkış Tarihiniz</p>
                  <p className="text-lg font-black text-orange-900">{formattedEndDate()}</p>
                </div>
                <div className="bg-white p-2 rounded-lg shadow-sm">
                   <Calendar className="text-orange-500" size={24} />
                </div>
              </div>
            )}

            {isChecking ? (
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                 <Loader2 className="text-blue-500 animate-spin" size={20} />
                 <p className="text-sm font-bold text-blue-800">Müsaitlik durumu kontrol ediliyor...</p>
               </div>
            ) : isFull ? (
               <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3 shadow-inner">
                 <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={24} />
                 <div>
                    <h4 className="font-black text-red-800 mb-1">Seçilen Tarihler Dolu</h4>
                    <p className="text-sm font-medium text-red-700">Maalesef seçtiğiniz tarihler arasında <strong>{data.category.name} {data.category.person_capacity !== 'Standart / Çadır' ? `(${data.category.person_capacity})` : ''}</strong> alanımız tamamen doludur.</p>
                 </div>
               </div>
            ) : (
               <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                 <CheckCircle2 className="text-green-600 shrink-0" size={24} />
                 <p className="text-sm font-bold text-green-800">Seçtiğiniz tarihlerde bu üniteden <strong>{availableSpots} müsait yerimiz</strong> bulunuyor.</p>
               </div>
            )}

          </motion.div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onPrev} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} /> Geri
        </button>
        <button 
          onClick={onNext} 
          disabled={!data.startDate || !data.package || isChecking || isFull}
          className="flex-1 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: 'var(--color-brand-green)' }}
        >
          {isChecking ? "Kontrol Ediliyor..." : isFull ? "Kapasite Dolu" : "Devam Et"} <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}