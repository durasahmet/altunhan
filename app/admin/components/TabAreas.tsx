"use client";
import { useState, useEffect } from "react";
import {
  Plus, Settings, X, MapPin, Save, Wrench, CreditCard,
  Tag, Users, Info, ChevronDown, ChevronUp, Layers, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";

// ─── TİPLER ───────────────────────────────────────────────────────────────────
interface AreaVariant {
  id?: number;
  area_id?: number;
  person_capacity: string;
  capacity: number;
  occupied: number;
  maintenance_count: number;
  price_daily: number;
  price_3days: number;
  price_weekly: number;
  price_monthly: number;
  price_6months: number;
  price_yearly: number;
}

interface Area {
  id: number;
  name: string;
  main_category: string;
  map_top: string;
  map_left: string;
  status: string;
  variants?: AreaVariant[];
  isOpen?: boolean;
}

// ─── BOŞ VARİANT ŞABLONU ─────────────────────────────────────────────────────
const emptyVariant = (): AreaVariant => ({
  person_capacity: "2 Kişilik",
  capacity: 0,
  occupied: 0,
  maintenance_count: 0,
  price_daily: 0,
  price_3days: 0,
  price_weekly: 0,
  price_monthly: 0,
  price_6months: 0,
  price_yearly: 0,
});

const PRICE_LABELS: { label: string; key: keyof AreaVariant; icon: string }[] = [
  { label: "Günlük",   key: "price_daily",   icon: "1G" },
  { label: "3 Günlük", key: "price_3days",   icon: "3G" },
  { label: "Haftalık", key: "price_weekly",  icon: "7G" },
  { label: "Aylık",    key: "price_monthly", icon: "1A" },
  { label: "6 Aylık",  key: "price_6months", icon: "6A" },
  { label: "Yıllık",   key: "price_yearly",  icon: "1Y" },
];

const CAPACITY_OPTIONS = [
  "Standart / Çadır",
  "2 Kişilik",
  "4 Kişilik",
  "6 Kişilik",
  "8 Kişilik",
];

// ─── VARİANT DÜZENLEME PANELİ ────────────────────────────────────────────────
function VariantEditor({
  variants,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
}: {
  variants: AreaVariant[];
  onAddVariant: () => void;
  onRemoveVariant: (idx: number) => void;
  onUpdateVariant: (idx: number, field: string, value: any) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Aktif idx sınır kontrolü
  const safeIdx = Math.min(activeIdx, variants.length - 1);
  const activeVariant = variants[safeIdx];

  const handleAdd = () => {
    onAddVariant();
    setActiveIdx(variants.length); 
  };

  const handleRemove = (idx: number) => {
    onRemoveVariant(idx);
    setActiveIdx((prev) => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  return (
    <div className="space-y-3">
      {/* Başlık + Ekle */}
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Users size={14} /> Kapasite Kategorileri
        </label>
        <button
          onClick={handleAdd}
          className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-orange-200"
        >
          <Plus size={14} /> Kategori Ekle
        </button>
      </div>

      {/* Ana İki Sütun */}
      <div className="flex gap-3 min-h-[320px] flex-col sm:flex-row">
        {/* Sol: Kategori Listesi */}
        <div className="w-full sm:w-44 shrink-0 flex flex-col gap-1.5">
          {variants.map((v, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all border ${
                idx === safeIdx
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              <Users size={13} className="shrink-0" />
              <span className="truncate flex-1">{v.person_capacity}</span>
              {idx === safeIdx && <Check size={13} className="shrink-0" />}

              {/* Sil butonu */}
              {variants.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                  className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all
                    ${idx === safeIdx
                      ? "bg-red-500 text-white sm:opacity-0 sm:group-hover:opacity-100"
                      : "bg-red-100 text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                >
                  <X size={10} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sağ: Seçili Kategorinin Detayları */}
        {activeVariant && (
          <AnimatePresence mode="wait">
            <motion.div
              key={safeIdx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4"
            >
              {/* Kapasite Tipi + Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kapasite Tipi
                  </label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800 text-sm bg-white"
                    value={activeVariant.person_capacity}
                    onChange={(e) => onUpdateVariant(safeIdx, "person_capacity", e.target.value)}
                  >
                    {CAPACITY_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Stok (Adet)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold text-gray-800 text-sm bg-white"
                    value={activeVariant.capacity}
                    onChange={(e) => onUpdateVariant(safeIdx, "capacity", e.target.value)}
                  />
                </div>
              </div>

              {/* Fiyat Listesi */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} className="text-green-600" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    {activeVariant.person_capacity} — Fiyat Listesi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRICE_LABELS.map(({ label, key, icon }) => (
                    <div key={key} className="bg-white rounded-xl border border-green-100 p-2.5 space-y-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                          {icon}
                        </span>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                          {label}
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          className="w-full p-1.5 rounded-lg border border-gray-100 font-bold text-gray-800 text-sm outline-none focus:border-green-400 bg-gray-50"
                          value={(activeVariant as any)[key]}
                          onChange={(e) => onUpdateVariant(safeIdx, key as string, e.target.value)}
                        />
                        <span className="text-xs font-black text-gray-400">₺</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── ANA BİLEŞEN ──────────────────────────────────────────────────────────────
export default function TabAreas({ areas }: { areas: any[] }) {
  const [areaList, setAreaList] = useState<Area[]>([]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!areas || areas.length === 0) return;
      const areaIds = areas.map((a) => a.id);
      const { data: variants } = await supabase
        .from("area_variants")
        .select("*")
        .in("area_id", areaIds);

      setAreaList(
        areas.map((a) => ({
          ...a,
          isOpen: false,
          variants: variants ? variants.filter((v: any) => v.area_id === a.id) : [],
        }))
      );
    };
    fetchVariants();
  }, [areas]);

  // ─── MODAL STATE ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentArea, setCurrentArea] = useState<Partial<Area>>({
    id: undefined,
    name: "",
    main_category: "Karavan Kiralama",
    map_top: "50%",
    map_left: "50%",
    variants: [emptyVariant()],
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentArea({ ...currentArea, map_top: `${y}%`, map_left: `${x}%` });
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentArea({
      id: undefined,
      name: "",
      main_category: "Karavan Kiralama",
      map_top: "50%",
      map_left: "50%",
      variants: [emptyVariant()],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (area: Area) => {
    setEditMode(true);
    setCurrentArea({
      ...area,
      variants: area.variants && area.variants.length > 0 ? area.variants : [emptyVariant()],
    });
    setIsModalOpen(true);
  };

  // ─── VARİANT OPERASYONLARI ───────────────────────────────────────────────────
  const addVariant = () => {
    setCurrentArea({
      ...currentArea,
      variants: [...(currentArea.variants || []), emptyVariant()],
    });
  };

  const removeVariant = (idx: number) => {
    const variants = [...(currentArea.variants || [])];
    variants.splice(idx, 1);
    setCurrentArea({ ...currentArea, variants });
  };

  const updateVariant = (idx: number, field: string, value: any) => {
    const variants = [...(currentArea.variants || [])];
    variants[idx] = { ...variants[idx], [field]: value };
    setCurrentArea({ ...currentArea, variants });
  };

  // ─── KAYDET ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const areaPayload = {
      name: currentArea.name,
      main_category: currentArea.main_category,
      map_top: currentArea.map_top,
      map_left: currentArea.map_left,
    };

    let areaId = currentArea.id;

    if (editMode && areaId) {
      const { error } = await supabase.from("areas").update(areaPayload).eq("id", areaId);
      if (error) return alert("Alan güncellenirken hata: " + error.message);
    } else {
      const { data, error } = await supabase
        .from("areas")
        .insert([{ ...areaPayload, status: "active" }])
        .select();
      if (error || !data) return alert("Alan eklenirken hata: " + error?.message);
      areaId = data[0].id;
    }

    if (editMode && areaId) {
      await supabase.from("area_variants").delete().eq("area_id", areaId);
    }

    const variantPayloads = (currentArea.variants || []).map((v) => ({
      area_id: areaId,
      person_capacity: v.person_capacity,
      capacity: parseInt(String(v.capacity)) || 0,
      occupied: v.occupied || 0,
      maintenance_count: v.maintenance_count || 0,
      price_daily: parseInt(String(v.price_daily)) || 0,
      price_3days: parseInt(String(v.price_3days)) || 0,
      price_weekly: parseInt(String(v.price_weekly)) || 0,
      price_monthly: parseInt(String(v.price_monthly)) || 0,
      price_6months: parseInt(String(v.price_6months)) || 0,
      price_yearly: parseInt(String(v.price_yearly)) || 0,
    }));

    const { data: newVariants, error: vError } = await supabase
      .from("area_variants")
      .insert(variantPayloads)
      .select();

    if (vError) return alert("Varyantlar kaydedilirken hata: " + vError.message);

    const updatedArea: Area = {
      ...(currentArea as Area),
      id: areaId!,
      variants: newVariants || [],
      isOpen: false,
    };

    if (editMode) {
      setAreaList(areaList.map((a) => (a.id === areaId ? updatedArea : a)));
    } else {
      setAreaList([...areaList, updatedArea]);
    }

    setIsModalOpen(false);
  };

  // ─── SİL ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu alanı ve tüm alt kategorilerini silmek istiyor musunuz?")) return;
    await supabase.from("area_variants").delete().eq("area_id", id);
    const { error } = await supabase.from("areas").delete().eq("id", id);
    if (!error) setAreaList(areaList.filter((a) => a.id !== id));
    else alert("Silinirken hata: " + error.message);
  };

  // ─── BAKIM (Sadece Varyant İçin Çalışır) ────────────────────────────────────
  const handleMaintenance = async (variant: AreaVariant) => {
    const input = window.prompt(
      `${variant.person_capacity} için bakımdaki parsel sayısını girin (0 = aktif):`,
      String(variant.maintenance_count || 0)
    );
    if (input === null) return;
    const count = parseInt(input, 10);
    if (isNaN(count) || count < 0 || count > variant.capacity) {
      alert("Geçerli bir sayı girin. Kapasiteyi aşamazsınız.");
      return;
    }
    const { error } = await supabase
      .from("area_variants")
      .update({ maintenance_count: count })
      .eq("id", variant.id);

    if (!error) {
      setAreaList(
        areaList.map((a) => ({
          ...a,
          variants: a.variants?.map((v) =>
            v.id === variant.id ? { ...v, maintenance_count: count } : v
          ),
        }))
      );
    } else alert("Bakım güncellenirken hata: " + error.message);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Tesis Alanları ve Fiyat Yönetimi
        </h2>
        <button
          onClick={handleAddNew}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-900 shadow-lg transition-colors border border-gray-700"
        >
          <Plus size={18} /> Yeni Alan Ekle
        </button>
      </div>

      {/* Alan Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {areaList.map((area) => {
          // 🚀 YENİ EKLENDİ: Ana Kart için Toplamları Hesapla
          const totalCapacity = area.variants?.reduce((acc, v) => acc + v.capacity, 0) || 0;
          const totalOccupied = area.variants?.reduce((acc, v) => acc + v.occupied, 0) || 0;
          const totalMaintenance = area.variants?.reduce((acc, v) => acc + v.maintenance_count, 0) || 0;
          const activeCapacity = totalCapacity - totalMaintenance;

          return (
            <div
              key={area.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:border-orange-200"
            >
              {/* Ana Kart Başlığı (ÖZET GÖRÜNÜM) */}
              <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() =>
                        setAreaList(
                          areaList.map((a) =>
                            a.id === area.id ? { ...a, isOpen: !a.isOpen } : a
                          )
                        )
                      }
                      className="p-2 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                    >
                      {area.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                          <Tag size={10} /> {area.main_category}
                        </span>
                        <h3 className="font-black text-xl text-gray-800">{area.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Layers size={12} />
                        {area.variants?.length || 0} kapasite kategorisi
                      </p>
                    </div>
                  </div>

                  {/* Toplam Barlar */}
                  <div className="pl-11 mt-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-500">
                        Genel Doluluk Durumu: <strong className="text-gray-800">{totalOccupied} / {activeCapacity}</strong> Dolu
                      </span>
                      {totalMaintenance > 0 && (
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <Wrench size={12} /> {totalMaintenance} Bakımda
                        </span>
                      )}
                    </div>
                    <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{ width: `${activeCapacity > 0 ? (totalOccupied / activeCapacity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(area)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Settings size={16} /> Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-colors border border-red-100"
                  >
                    <X size={16} /> Sil
                  </button>
                </div>
              </div>

              {/* Varyantlar Detayları (Açılır Menü) */}
              <AnimatePresence>
                {area.isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                      {area.variants && area.variants.length > 0 ? (
                        area.variants.map((v) => {
                          const active = v.capacity - (v.maintenance_count || 0);
                          const fill = active > 0 ? (v.occupied / active) * 100 : 0;
                          return (
                            <div
                              key={v.id}
                              className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
                            >
                              <div className="flex-1 w-full">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                    <Users size={10} /> {v.person_capacity}
                                  </span>
                                  {v.maintenance_count > 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Wrench size={11} /> {v.maintenance_count} Bakımda
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mb-1">
                                  Kapasite:{" "}
                                  <span className="font-bold text-gray-800">
                                    {v.occupied} / {active}
                                  </span>{" "}
                                  dolu (toplam: {v.capacity})
                                </p>
                                <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden mb-3">
                                  <div
                                    className="bg-blue-500 h-full transition-all"
                                    style={{ width: `${fill}%` }}
                                  />
                                </div>
                                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                                  {PRICE_LABELS.map(
                                    ({ label, key }) =>
                                      (v as any)[key] > 0 && (
                                        <span
                                          key={key}
                                          className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1"
                                        >
                                          <CreditCard size={10} /> {label}:{" "}
                                          {(v as any)[key]}₺
                                        </span>
                                      )
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleMaintenance(v)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                                  v.maintenance_count > 0
                                    ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                                    : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                                }`}
                              >
                                <Wrench size={15} />
                                {v.maintenance_count > 0 ? "Bakımı Güncelle" : "Bakıma Al"}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-gray-400 text-sm py-4">
                          Henüz kategori eklenmedi. Düzenle butonuna tıklayın.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden my-8 border border-white/20"
            >
              {/* Modal Başlık */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Settings className="text-orange-500" size={24} />
                  {editMode ? "Alanı Düzenle" : "Yeni Alan Oluştur"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Bilgi */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800 font-medium">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  <p>
                    Sol listeden kategori seçin, sağ panelde o kategoriye ait kapasite ve fiyatları düzenleyin.
                    Yeni kategori eklemek için <strong>Kategori Ekle</strong> butonunu kullanın.
                  </p>
                </div>

                {/* Alan Bilgileri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Ana Başlık
                    </label>
                    <select
                      className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800 appearance-none bg-white"
                      value={currentArea.main_category}
                      onChange={(e) =>
                        setCurrentArea({ ...currentArea, main_category: e.target.value })
                      }
                    >
                      <option>Karavan Kiralama</option>
                      <option>Alan Kiralama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Alan Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Göl Kenarı Karavan"
                      className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-orange-500 font-bold text-gray-800"
                      value={currentArea.name}
                      onChange={(e) =>
                        setCurrentArea({ ...currentArea, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* ─── KAPASİTE KATEGORİLERİ (Sol-Sağ Panel) ─────────────────── */}
                <VariantEditor
                  variants={currentArea.variants || [emptyVariant()]}
                  onAddVariant={addVariant}
                  onRemoveVariant={removeVariant}
                  onUpdateVariant={updateVariant}
                />

                {/* Harita */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Harita Konumu
                  </label>
                  <div
                    className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-gray-100 cursor-crosshair group shadow-inner"
                    onClick={handleMapClick}
                  >
                    <img
                      src="/Render.jpg"
                      alt="Harita"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ top: currentArea.map_top, left: currentArea.map_left }}
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <MapPin
                        size={48}
                        className="drop-shadow-2xl text-orange-500 relative z-10"
                        style={{ fill: "#fff" }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                >
                  <Save size={24} /> Tüm Değişiklikleri Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}