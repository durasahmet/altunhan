"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Search, CheckCircle, XCircle, ShieldAlert, User, MapPin, Clock, SwitchCamera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";

export default function TabGate() {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string>("");
  const jsQRRef = useRef<any>(null);
  const isLoadingRef = useRef(false);
  const facingModeRef = useRef(facingMode);

  useEffect(() => {
    import("jsqr").then((mod) => {
      jsQRRef.current = mod.default;
      startCamera();
    });
    return () => { stopCamera(); };
  }, []);

  const stopCamera = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  const handleVerify = useCallback(async (code: string) => {
    if (!code || code === lastScannedRef.current || isLoadingRef.current) return;
    lastScannedRef.current = code;
    isLoadingRef.current = true;
    setIsLoading(true);
    setResult(null);
    setQrCode(code);

    const cleanCode = code.trim().toUpperCase();
    try {
      const { data, error } = await supabase.from("reservations").select("*").eq("id", cleanCode).single();
      if (error || !data) {
        setResult({ status: "error", message: "Geçersiz Karekod! Sistemde böyle bir üye bulunamadı." });
      } else if (data.status === "pending") {
        setResult({ status: "pending", message: "Bu rezervasyon henüz admin tarafından ONAYLANMAMIŞ. Giriş yapılamaz!", user: data });
      } else if (data.status === "approved") {
        setResult({ status: "success", message: "Geçiş Onaylandı! Giriş yapılabilir.", user: data });
      } else {
        setResult({ status: "error", message: "Bu üyeliğin süresi dolmuş veya iptal edilmiş." });
      }
    } catch (e) {
      setResult({ status: "error", message: "Sunucu bağlantı hatası. Lütfen tekrar deneyin." });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const jsQR = jsQRRef.current;
    if (!video || !canvas || !jsQR) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code?.data && !isLoadingRef.current) { handleVerify(code.data); }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleVerify]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeRef.current, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") setCameraError("Kamera izni reddedildi. Tarayıcı ayarlarından izin verin.");
      else if (err.name === "NotFoundError") setCameraError("Kamera bulunamadı.");
      else setCameraError("Kamera başlatılamadı: " + err.message);
    }
  }, [scanFrame]);

  const toggleCamera = () => {
    const next = facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = next;
    setFacingMode(next);
    startCamera();
  };

  const handleReset = () => {
    setResult(null);
    setQrCode("");
    lastScannedRef.current = "";
    isLoadingRef.current = false;
  };

  const handleManualScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    lastScannedRef.current = "";
    isLoadingRef.current = false;
    handleVerify(qrCode);
  };

  return (
    // ✅ DEĞİŞİKLİK 1: lg:h — sabit yükseklik sadece masaüstünde
    <div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-8rem)]">

      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        {/* ✅ DEĞİŞİKLİK 2: lg:flex-1 — kamera paneli mobilde tüm boşluğu yutmuyor */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:flex-1 flex flex-col">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Camera className="text-orange-500" /> Okuyucu Modülü
          </h2>

          <div className="relative w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-100 mb-6 shadow-2xl">
            <canvas ref={canvasRef} className="hidden" />
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-4 z-20">
                <XCircle size={40} className="text-red-400 mb-3" />
                <p className="text-white/80 text-sm font-semibold mb-4">{cameraError}</p>
                <button onClick={startCamera} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">Tekrar Dene</button>
              </div>
            )}

            {!cameraError && !isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
                <motion.div
                  animate={{ y: ["5%", "90%", "5%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
                />
              </div>
            )}

            <button onClick={toggleCamera} className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-black/70 transition-colors" title="Kamerayı Çevir">
              <SwitchCamera size={18} />
            </button>

            <p className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[10px] text-white/60 font-bold tracking-widest uppercase z-20 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
              {isScanning ? "Lazer Tarayıcı Aktif" : "Başlatılıyor..."}
            </p>
          </div>

          <form onSubmit={handleManualScan} className="mt-auto">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Manuel Giriş (veya Okuyucu)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Örn: M-123456"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800 uppercase tracking-widest text-lg transition-colors"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button type="submit" disabled={!qrCode || isLoading} className="w-full mt-3 py-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-50">
              {isLoading ? "Sorgulanıyor..." : "Sorgula"}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ DEĞİŞİKLİK 3: min-h-[500px] — mobilde sonuç paneli ezilmiyor */}
      <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">Sorgu Sonucu</h2>
          {isLoading && <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />}
        </div>

        <div className="p-8 flex-1 flex items-center justify-center bg-gray-50/50">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-400">
                <Camera size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-lg">Karekod okutulması bekleniyor...</p>
              </motion.div>
            )}

            {result?.status === "success" && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                <div className="bg-green-500 p-8 rounded-t-3xl text-center text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-20"><CheckCircle size={150} /></div>
                  <CheckCircle size={64} className="mx-auto mb-4 relative z-10" />
                  <h3 className="text-3xl font-black relative z-10">GİRİŞ ONAYLANDI</h3>
                  <p className="text-green-100 font-bold mt-2 relative z-10">{result.message}</p>
                </div>
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-gray-200 shadow-xl space-y-4">
                  <div className="flex items-center gap-3"><User className="text-gray-400" /><span className="font-bold text-lg text-gray-800">{result.user.name}</span></div>
                  <div className="flex items-center gap-3"><MapPin className="text-orange-500" /><span className="font-bold text-gray-600">Bölge: <span className="text-gray-800">{result.user.category} / {result.user.parcel}</span></span></div>
                  <div className="flex items-center gap-3"><Clock className="text-blue-500" /><span className="font-bold text-gray-600">Üyelik Numarası: <span className="text-gray-800">{result.user.id}</span></span></div>
                  <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <button onClick={handleReset} className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors w-full">Sonraki Taramaya Geç</button>
                  </div>
                </div>
              </motion.div>
            )}

            {result?.status === "error" && (
              <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md text-center">
                <div className="bg-red-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-20"><XCircle size={150} /></div>
                  <XCircle size={80} className="mx-auto mb-4 relative z-10" />
                  <h3 className="text-3xl font-black relative z-10">GEÇİŞ REDDEDİLDİ</h3>
                  <p className="text-red-100 font-bold mt-4 bg-red-600/50 p-4 rounded-xl relative z-10">{result.message}</p>
                  <button onClick={handleReset} className="mt-8 bg-white text-red-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors relative z-10 w-full">Tekrar Dene</button>
                </div>
              </motion.div>
            )}

            {result?.status === "pending" && (
              <motion.div key="pending" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                <div className="bg-orange-500 p-8 rounded-t-3xl text-center text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-20"><ShieldAlert size={150} /></div>
                  <ShieldAlert size={64} className="mx-auto mb-4 relative z-10" />
                  <h3 className="text-2xl font-black relative z-10">ONAY BEKLEYEN KAYIT</h3>
                  <p className="text-orange-100 font-bold mt-2 relative z-10">{result.message}</p>
                </div>
                <div className="bg-white p-6 rounded-b-3xl border-x border-b border-gray-200 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-500">Kayıt Sahibi:</span>
                    <span className="font-black text-gray-800">{result.user.name}</span>
                  </div>
                  <p className="text-xs text-center text-gray-400 font-bold mt-4">Bu kişinin girişine izin vermek için "Müşteriler" sekmesinden kaydı onaylamanız gerekmektedir.</p>
                  <button onClick={handleReset} className="mt-6 w-full text-orange-600 font-bold text-sm bg-orange-50 px-4 py-3 rounded-xl hover:bg-orange-100 transition-colors">Taramayı Sıfırla</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}