"use client";

export default function ProgressBar({ step }: { step: number }) {
  // 5. adımda (başarı ekranı) progress barı gizlemek istersen bu satırı açabilirsin
  if (step === 5) return null; 

  return (
    <div className="bg-gray-50/80 border-b border-gray-100 px-4 sm:px-10 py-4 sm:py-6">
      <div className="flex justify-between items-center relative max-w-2xl mx-auto">
        
        {/* Arkadaki Gri Çizgi */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        
        {/* Aktiflik Çizgisi (Yeşil) - Zemin üzerinden ilerler */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((step - 1) / 3) * 100}%` }} // 4 adıma böldük (5. adım başarı olduğu için)
        ></div>

        {/* Adım Göstergeleri */}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1.5 sm:gap-2 bg-gray-50 px-1 sm:px-2 relative z-10">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-base transition-all duration-300 shadow-sm ${
              step >= item 
                ? 'bg-green-500 text-white ring-4 ring-green-100' 
                : 'bg-white text-gray-400 border-2 border-gray-200'
            }`}>
              {step > item ? '✓' : item}
            </div>
            {/* MOBİLDE YAZILARI GİZLEDİK (hidden sm:block) */}
            <span className={`hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-widest ${step >= item ? 'text-green-600' : 'text-gray-400'}`}>
              {item === 1 && "Kategori"}
              {item === 2 && "Tarih"}
              {item === 3 && "Harita"}
              {item === 4 && "Bilgiler"}
            </span>
          </div>
        ))}
        
      </div>
    </div>
  );
}