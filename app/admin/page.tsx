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
    fetchReservations();
    fetchAreas();
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) {
      console.error("Veri çekme hatası:", error);
      setIsLoading(false);
      return;
    }
    if (data) {
      setPending(data.filter((r: any) => r.status === 'pending'));
      setMembers(data.filter((r: any) => r.status === 'approved'));
    }
    setIsLoading(false);
  };

  const fetchAreas = async () => {
    const { data, error } = await supabase.from('areas').select('*').order('id');
    if (data) setAreas(data);
  };

  // 🚀 ONAYLA: Hem üyeyi onayla hem de kapasiteyi 1 artır
  const handleApprove = async (req: any) => {
    setPending(pending.filter(p => p.id !== req.id));
    setMembers([{...req, status: 'approved'}, ...members]);

    // 1. DB Onayı
    await supabase.from('reservations').update({ status: 'approved' }).eq('id', req.id);

    // 2. Doluluk Senkronizasyonu
    let areaName = req.category;
    const targetArea = areas.find(a => a.name === areaName);
    if (targetArea) {
      const newOccupied = (targetArea.occupied || 0) + 1;
      await supabase.from('areas').update({ occupied: newOccupied }).eq('id', targetArea.id);
      setAreas(areas.map(a => a.id === targetArea.id ? { ...a, occupied: newOccupied } : a));
    }
  };

  const handleUpdateMember = async (updatedMember: any) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    await supabase.from('reservations').update({ phone: updatedMember.phone }).eq('id', updatedMember.id);
  };

  // 🚀 SİL: Hem üyeyi sil hem de kapasiteyi 1 azalt
  const handleDeleteMember = async (memberId: string) => {
    const memberToDelete = members.find(m => m.id === memberId);
    setMembers(members.filter(m => m.id !== memberId));
    
    // 1. DB'den sil
    await supabase.from('reservations').delete().eq('id', memberId);

    // 2. Doluluk Senkronizasyonu
    if (memberToDelete) {
      const targetArea = areas.find(a => a.name === memberToDelete.category);
      if (targetArea) {
        const newOccupied = Math.max(0, (targetArea.occupied || 0) - 1);
        await supabase.from('areas').update({ occupied: newOccupied }).eq('id', targetArea.id);
        setAreas(areas.map(a => a.id === targetArea.id ? { ...a, occupied: newOccupied } : a));
      }
    }
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

        {activeTab === "dashboard" && <TabDashboard members={members} areas={areas} pendingCount={pending.length} />}
        {activeTab === "members" && <TabMembers pending={pending} members={members} onApprove={handleApprove} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
        {activeTab === "areas" && <TabAreas areas={areas} />}
        {activeTab === "gate" && <TabGate />}
      </main>
    </div>
  );
}