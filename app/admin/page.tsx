"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import TabMembers from "./components/TabMembers";
import TabDashboard from "./components/TabDashboard";
import TabAreas from "./components/TabAreas";
import TabGate from "./components/TabGate";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [pending, setPending] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // 🚀 SİHİRLİ FONKSİYON: BUGÜN İÇERİDE KİMLER VAR HESAPLAMASI
  const calculateRealTimeOccupancy = (currentAreas: any[], currentMembers: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return currentAreas.map(area => {
      // Bu alana ait ve ŞU AN aktif (bugün tarihi giriş-çıkış aralığında olan) müşterileri bul
      const activeInThisArea = currentMembers.filter(m => {
        let catName = m.category;
        try {
          const parsed = JSON.parse(m.category);
          if (parsed && parsed.name) catName = parsed.name;
        } catch(e) {}

        if (catName !== area.name) return false;

        // Tarih kontrolü (Müşteri bugün kampta mı?)
        if (m.start_date && m.end_date) {
          const start = new Date(m.start_date);
          const end = new Date(m.end_date);
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          
          return today >= start && today <= end;
        }
        return false;
      });

      // Alanın dolu sayısını dinamik olarak güncelle
      return { ...area, occupied: activeInThisArea.length };
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    
    // 🚀 YENİ SİSTEM: Artık 3 tabloyu da çekiyoruz (Varyantlar eklendi)
    const [resResponse, areasResponse, variantsResponse] = await Promise.all([
      supabase.from('reservations').select('*'),
      supabase.from('areas').select('*').order('id'),
      supabase.from('area_variants').select('*') // Alt kapasiteleri çeker
    ]);

    if (resResponse.error || areasResponse.error) {
      console.error("Veri çekme hatası", resResponse.error || areasResponse.error);
      setIsLoading(false);
      return;
    }

    const allReservations = resResponse.data || [];
    const rawAreas = areasResponse.data || [];
    const rawVariants = variantsResponse.data || [];

    // 🚀 DÜZELTME: Varyantların toplam kapasitelerini Ana Kategoriye aktar
    const areasWithCapacities = rawAreas.map(area => {
      const areaVariants = rawVariants.filter(v => v.area_id === area.id);
      const totalCapacity = areaVariants.reduce((sum, v) => sum + (v.capacity || 0), 0);
      const totalMaintenance = areaVariants.reduce((sum, v) => sum + (v.maintenance_count || 0), 0);
      
      return {
        ...area,
        capacity: totalCapacity, // NaN hatasını çözen kısım!
        maintenance_count: totalMaintenance
      };
    });

    const pendingData = allReservations.filter((r: any) => r.status === 'pending');
    const approvedData = allReservations.filter((r: any) => r.status === 'approved');

    setPending(pendingData);
    setMembers(approvedData);

    // 🚀 Alanları state'e atarken GERÇEK ZAMANLI doluluğu hesapla
    const smartAreas = calculateRealTimeOccupancy(areasWithCapacities, approvedData);
    setAreas(smartAreas);
    
    setIsLoading(false);
  };

  // ONAYLA: Arayüzü anında güncelle ve hesaplamayı baştan yap
  const handleApprove = async (req: any) => {
    const newPending = pending.filter(p => p.id !== req.id);
    const newMembers = [{...req, status: 'approved'}, ...members];
    
    setPending(newPending);
    setMembers(newMembers);
    setAreas(calculateRealTimeOccupancy(areas, newMembers));

    await supabase.from('reservations').update({ status: 'approved' }).eq('id', req.id);
  };

  const handleUpdateMember = async (updatedMember: any) => {
    const newMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setMembers(newMembers);
    setAreas(calculateRealTimeOccupancy(areas, newMembers)); 
    await supabase.from('reservations').update({ phone: updatedMember.phone }).eq('id', updatedMember.id);
  };

  // SİL: Arayüzü anında güncelle ve hesaplamayı baştan yap
  const handleDeleteMember = async (memberId: string) => {
    const newMembers = members.filter(m => m.id !== memberId);
    setMembers(newMembers);
    setAreas(calculateRealTimeOccupancy(areas, newMembers));
    await supabase.from('reservations').delete().eq('id', memberId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pending.length} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto relative h-screen">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        )}

        {activeTab === "dashboard" && <TabDashboard members={members} areas={areas} pendingCount={pending.length} setActiveTab={setActiveTab} />}
        {activeTab === "members" && <TabMembers pending={pending} members={members} onApprove={handleApprove} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
        {activeTab === "areas" && <TabAreas areas={areas} />}
        {activeTab === "gate" && <TabGate />}
      </main>
    </div>
  );
}