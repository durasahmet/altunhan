"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import TabMembers from "./components/TabMembers";
import TabDashboard from "./components/TabDashboard";
import TabAreas from "./components/TabAreas";
import TabGate from "./components/TabGate";
import TabLeads from "./components/TabLeads";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [pending, setPending] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const calculateRealTimeOccupancy = (currentAreas: any[], currentMembers: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return currentAreas.map(area => {
      const activeInThisArea = currentMembers.filter(m => {
        let catName = m.category;
        try {
          const parsed = JSON.parse(m.category);
          if (parsed && parsed.name) catName = parsed.name;
        } catch(e) {}

        if (catName !== area.name) return false;

        if (m.start_date && m.end_date) {
          const start = new Date(m.start_date);
          const end = new Date(m.end_date);
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          
          return today >= start && today <= end;
        }
        return false;
      });
      return { ...area, occupied: activeInThisArea.length };
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    
    // VERİLERİ SUPABASE'DEN ÇEKİYORUZ
    const [resResponse, areasResponse, variantsResponse, requestsResponse] = await Promise.all([
      supabase.from('reservations').select('*'),
      supabase.from('areas').select('*').order('id'),
      supabase.from('area_variants').select('*'),
      supabase.from('contact_requests').select('*').order('created_at', { ascending: false })
    ]);

    if (resResponse.error || areasResponse.error) {
      console.error("Veri çekme hatası", resResponse.error || areasResponse.error);
      setIsLoading(false);
      return;
    }

    const allReservations = resResponse.data || [];
    const rawAreas = areasResponse.data || [];
    const rawVariants = variantsResponse.data || [];
    setRequests(requestsResponse.data || []);

    const areasWithCapacities = rawAreas.map(area => {
      const areaVariants = rawVariants.filter(v => v.area_id === area.id);
      const totalCapacity = areaVariants.reduce((sum, v) => sum + (v.capacity || 0), 0);
      const totalMaintenance = areaVariants.reduce((sum, v) => sum + (v.maintenance_count || 0), 0);
      
      return {
        ...area,
        capacity: totalCapacity, 
        maintenance_count: totalMaintenance
      };
    });

    const pendingData = allReservations.filter((r: any) => r.status === 'pending');
    const approvedData = allReservations.filter((r: any) => r.status === 'approved');

    setPending(pendingData);
    setMembers(approvedData);
    setAreas(calculateRealTimeOccupancy(areasWithCapacities, approvedData));
    setIsLoading(false);
  };

  // REZERVASYON İŞLEMLERİ
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

  const handleDeleteMember = async (memberId: string) => {
    const newMembers = members.filter(m => m.id !== memberId);
    setMembers(newMembers);
    setAreas(calculateRealTimeOccupancy(areas, newMembers));
    await supabase.from('reservations').delete().eq('id', memberId);
  };

  // TALEP (LEAD) İŞLEMLERİ
  const handleUpdateReqStatus = async (id: number, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    await supabase.from('contact_requests').update({ status: newStatus }).eq('id', id);
  };

  const handleDeleteReq = async (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    await supabase.from('contact_requests').delete().eq('id', id);
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

        {/* EKRAN YÖNLENDİRMELERİ */}
        {activeTab === "dashboard" && <TabDashboard members={members} areas={areas} pendingCount={pending.length} setActiveTab={setActiveTab} />}
        {activeTab === "leads" && <TabLeads requests={requests} onUpdateStatus={handleUpdateReqStatus} onDeleteReq={handleDeleteReq} />}
        {activeTab === "members" && <TabMembers pending={pending} members={members} onApprove={handleApprove} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
        {activeTab === "areas" && <TabAreas areas={areas} />}
        {activeTab === "gate" && <TabGate />}
      </main>
    </div>
  );
}