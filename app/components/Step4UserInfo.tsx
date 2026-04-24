"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, FileText, Users, User, Car } from "lucide-react";

export default function Step4UserInfo({
  data,
  setData,
  onPrev,
  onComplete,
  slideVariants
}: any) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // 🚀 YETİŞKİN VE ÇOCUK SAYISINI ÇEK (Varsayılan 1 Yetişkin)
  const totalAdults = data.guests?.adults || 1;
  const totalChildren = data.guests?.children || 0;
  const totalGuests = totalAdults + totalChildren;

  // 🚀 DİNAMİK MİSAFİR LİSTESİ OLUŞTURUCU
  // Eğer guestList yoksa veya sayısı değişmişse (Kullanıcı geri dönüp sayıyı değiştirmiş olabilir), yeniden oluştur
  useEffect(() => {
    if (!data.customer.guestsList || data.customer.guestsList.length !== totalGuests) {
      const initialGuests = Array.from({ length: totalGuests }).map((_, i) => ({
        type: i < totalAdults ? 'Yetişkin' : 'Çocuk',
        name: "",
        tc: ""
      }));
      setData({ ...data, customer: { ...data.customer, guestsList: initialGuests } });
    }
  }, [totalAdults, totalChildren]);

  const calculateEndDate = () => {
    if (!data.startDate || !data.package) return "Hesaplanıyor...";
    const start = new Date(data.startDate);
    const days = parseInt(String(data.package.duration).replace(/\D/g, ''), 10) || 0; 
    const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));
    return end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatStartDate = () => {
    if (!data.startDate) return "";
    const start = new Date(data.startDate);
    return start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleInputChange = (field: string, value: string) => {
    setData({
      ...data,
      customer: { ...data.customer, [field]: value }
    });
  };

  // Dinamik Misafir Alanlarını Güncelleme Fonksiyonu
  const handleGuestChange = (index: number, field: string, value: string) => {
    const updatedGuests = [...(data.customer.guestsList || [])];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setData({
      ...data,
      customer: { ...data.customer, guestsList: updatedGuests }
    });
  };

  // 🚀 SIKI DOĞRULAMA (VALIDATION)
  // 1. Şartlar kabul edildi mi?
  // 2. Ana iletişim bilgileri dolu mu?
  // 3. (ÖNEMLİ) Dinamik oluşturulan tüm misafirlerin İsim ve TC'leri dolu mu?
  const areAllGuestsFilled = data.customer.guestsList?.every((g: any) => g.name.trim() !== "" && g.tc.trim() !== "");
  const isValid = termsAccepted && data.customer.name && data.customer.phone && areAllGuestsFilled;

  return (
    <>
      <motion.div key="step4" variants={slideVariants} initial="hiddenRight" animate="visible" exit="exit" className="flex flex-col h-full relative">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-brand-green)' }}>Kişisel Bilgileriniz</h2>
        
        {/* Sipariş Özeti Kartı */}
        <div className="mb-6 p-5 rounded-2xl text-white shadow-lg" style={{ backgroundColor: 'var(--color-brand-green)' }}>
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
            <div>
              <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Seçiminiz</p>
              <p className="font-black text-lg">{data.categoryGroup || data.category?.name}</p>
              <p className="font-medium text-green-100">{data.package?.name} ({data.package?.duration})</p>
              <p className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mt-2 mr-2">Alan: {data.parcel}</p>
              <p className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mt-2">{totalGuests} Kişi</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Toplam Tutar</p>
              <p className="text-2xl font-black text-orange-400">{data.package?.price?.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 text-sm font-bold bg-black/20 p-3 rounded-xl">
            <span>{formatStartDate()}</span> 
            <ArrowRight className="text-orange-400" size={16}/> 
            <span>{calculateEndDate()}</span>
          </div>
        </div>

        {/* 1. BÖLÜM: HESAP SAHİBİ (İLETİŞİM BİLGİLERİ) */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-orange-500" size={20} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">İletişim Bilgileri (Hesap Sahibi)</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 font-medium">Biletiniz ve rezervasyon detaylarınız bu iletişim bilgilerine gönderilecektir.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Ad Soyad" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold transition-colors" value={data.customer.name} onChange={e => handleInputChange('name', e.target.value)} />
            <input type="tel" placeholder="Telefon Numarası" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold transition-colors" value={data.customer.phone} onChange={e => handleInputChange('phone', e.target.value)} />
            <input type="email" placeholder="E-Posta Adresi" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold transition-colors" value={data.customer.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
            <input type="password" placeholder="Sisteme Giriş Şifresi Belirleyin" className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold transition-colors" value={data.customer.password || ''} onChange={e => handleInputChange('password', e.target.value)} />
          </div>
        </div>

        {/* 2. BÖLÜM: KONAKLAYANLARIN BİLGİLERİ (KBS İÇİN ZORUNLU) */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-500" size={20} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Konaklayan Bilgileri (K.B.S)</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 font-medium">Yasal zorunluluk gereği konaklayacak <strong>tüm misafirlerin</strong> TC Kimlik ve İsim bilgilerinin eksiksiz girilmesi gerekmektedir.</p>
          
          <div className="space-y-4">
            {data.customer.guestsList?.map((guest: any, index: number) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                  {guest.type} {index + 1}
                </div>
                <input 
                  type="text" 
                  placeholder={`${guest.type} Ad Soyad`} 
                  className="flex-1 p-3 pt-4 sm:pt-3 rounded-lg border border-gray-100 outline-none focus:border-blue-500 text-gray-800 font-bold text-sm" 
                  value={guest.name} 
                  onChange={e => handleGuestChange(index, 'name', e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="TC Kimlik / Pasaport No" 
                  className="flex-1 p-3 pt-4 sm:pt-3 rounded-lg border border-gray-100 outline-none focus:border-blue-500 text-gray-800 font-bold text-sm" 
                  value={guest.tc} 
                  onChange={e => handleGuestChange(index, 'tc', e.target.value)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. BÖLÜM: ARAÇ BİLGİSİ (OPSİYONEL) */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Car className="text-gray-400" size={20} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Araç Bilgisi (Opsiyonel)</h3>
          </div>
          <input type="text" placeholder="Tesis içine girecek aracınızın plakası (Örn: 34 ABC 123)" className="w-full sm:w-1/2 p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 text-gray-800 font-bold transition-colors" value={data.customer.plate} onChange={e => handleInputChange('plate', e.target.value)} />
        </div>

        {/* Sözleşme Onayı */}
        <label className="flex items-start gap-3 mb-8 cursor-pointer bg-orange-50 p-4 rounded-xl border border-orange-100 transition-colors hover:bg-orange-100/50">
          <input type="checkbox" className="mt-1 w-5 h-5 accent-orange-500 rounded cursor-pointer" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
          <span className="text-sm text-gray-700 font-medium">
            Tesis kurallarını, iptal/iade koşullarını ve ortak alan kullanım yönergelerini{' '}
            <span 
              onClick={(e) => { e.preventDefault(); setIsRulesModalOpen(true); }} 
              className="underline text-orange-600 font-bold cursor-pointer hover:text-orange-800"
            >
              okudum ve kabul ediyorum
            </span>.
          </span>
        </label>

        <div className="flex gap-4 mt-auto">
          <button onClick={onPrev} className="w-1/3 py-4 bg-gray-200 rounded-xl font-black text-gray-600 hover:bg-gray-300 transition-colors">Geri</button>
          <button 
            onClick={onComplete} 
            disabled={!isValid} 
            className="w-2/3 py-4 text-white rounded-xl font-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90" 
            style={{ backgroundColor: 'var(--color-brand-orange)' }}
          >
            {isValid ? "Rezervasyonu Tamamla" : "Eksik Bilgileri Doldurun"}
          </button>
        </div>
      </motion.div>

      {/* KURALLAR POP-UP (MODAL) */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="text-orange-500" size={24} />
                  <h2 className="text-xl font-black text-gray-800">Altunhan Kamp Karavan Tesis Kuralları</h2>
                </div>
                <button onClick={() => setIsRulesModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-600">
                <p className="font-medium text-gray-500 mb-2">
                  Değerli misafirimiz, Altunhan Kamp Karavan Alanı'nda sizlere huzurlu ve güvenli bir konaklama deneyimi sunabilmek için aşağıdaki kurallara uyulması büyük önem taşımaktadır:
                </p>
                <ul className="space-y-4">
                  <li><strong className="text-gray-800">1. Çıkış İşlemleri:</strong> Konaklama süreniz sona erdiğinde, tesisten ayrılmadan önce resepsiyona/danışmaya bilgi verilmesi zorunludur. Aksi takdirde konaklama hesabınız açık kalmaya devam edecektir.</li>
                  <li><strong className="text-gray-800">2. Kimlik Bildirimi (K.B.S):</strong> Yasal mevzuat ve Kimlik Bildirim Sistemi (K.B.S) gereğince tesisimize giriş yapan tüm misafirlerimizin kimlik ibrazı zorunludur.</li>
                  <li><strong className="text-gray-800">3. Yerleşme ve Parsel Düzeni:</strong> Konaklamalar, idare tarafından belirlenen blok ve parsel numaralarına göre yapılmalıdır. Görevlilerin tahsis ettiği alanların dışına yerleşmek veya çadır/karavan kurmak kesinlikle yasaktır.</li>
                  <li><strong className="text-gray-800">4. Günübirlik Alan Kullanımı:</strong> Tesis içerisindeki günübirlik piknik alanları, geceleme veya konaklama amacıyla kullanılamaz.</li>
                  <li><strong className="text-gray-800">5. Araç Hız Sınırı:</strong> Tesis içerisinde can güvenliği ve toz oluşumunu engellemek için araç hız sınırı azami <strong>20 km/s</strong> olarak belirlenmiştir.</li>
                  <li><strong className="text-gray-800">6. Çevre Temizliği:</strong> Atıkların ve çöplerin yalnızca idare tarafından belirlenen ve tesis geneline yerleştirilen çöp konteynerlerine atılması rica olunur.</li>
                  <li><strong className="text-gray-800">7. Ateş Yakma Kuralları:</strong> Üniteler arasında, açık alanlarda veya ateş yakmak için özel olarak tahsis edilmemiş hiçbir bölgede odun, kömür veya tüp gaz ile ateş yakılmasına kesinlikle müsaade edilmemektedir.</li>
                  <li><strong className="text-gray-800">8. Elektrik Kullanımı:</strong> Parsellere çekilecek elektrik tesisatının, idare tarafından onaylanan standartlarda olması gerekmektedir. Tesisatın kaldırabileceğinden daha yüksek akım çeken cihazların kullanımı tehlikeli ve yasaktır.</li>
                  <li><strong className="text-gray-800">9. Yüksek Akımlı Cihazlar:</strong> Çadır konaklamalarında güvenlik ve altyapı limitleri gereği elektrikli ocak, fırın ve yüksek voltajlı ısıtıcıların kullanımı yasaktır.</li>
                  <li><strong className="text-gray-800">10. Gürültü ve Eğlence:</strong> Çevreyi rahatsız edecek düzeyde yüksek sesle müzik dinlemek veya gürültü yapmak yasaktır. İdareden önceden izin alınarak düzenlenen etkinlikler ise en geç saat <strong>24:00'te</strong> sonlandırılmalıdır.</li>
                  <li><strong className="text-gray-800">11. Ödeme ve İade Koşulları:</strong> Konaklama ücretleri giriş esnasında peşin olarak tahsil edilir. Konaklamanın uzatılması durumunda ek süre ücreti yine peşin alınır. Kesilen fiş veya faturalar üzerinden ücret iadesi yapılmamaktadır.</li>
                  <li><strong className="text-gray-800">12. Ziyaretçi Kabulü:</strong> Konaklayan misafirlerimizi ziyarete gelen araç ve şahıslardan günlük giriş ücreti tahsil edilir. Ziyaretçilerin tesisi en geç saat <strong>21:00'de</strong> terk etmeleri gerekmektedir.</li>
                  <li><strong className="text-gray-800">13. Günübirlik Girişler:</strong> Günübirlik tesis kullanımlarında, araç tipi ve yolcu sayısına göre belirlenen güncel tarife üzerinden ücretlendirme yapılmaktadır.</li>
                  <li><strong className="text-gray-800">14. Parsel Kapasitesi (Çadır):</strong> Çadır parseli kiralamaları standart olarak "2 çadır ve 4 kişi" ile sınırlandırılmıştır. Belirtilen kapasiteyi aşan ilave çadır veya kişi için günlük ek ücret yansıtılmaktadır.</li>
                </ul>
              </div>

              <div className="p-5 border-t border-gray-100 bg-white shrink-0">
                <button 
                  onClick={() => {
                    setTermsAccepted(true); 
                    setIsRulesModalOpen(false);
                  }} 
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md"
                >
                  Okudum, Kabul Ediyorum
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}