"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import TabMembers from "./components/TabMembers";
import TabDashboard from "./components/TabDashboard";
import TabAreas from "./components/TabAreas";
import TabGate from "./components/TabGate";
import { supabase } from "../../lib/supabase"; // Supabase bağlantımız

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("members"); 
  
  // Veritabanından Gelecek Gerçek State'ler
  const [pending, setPending] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]); // ALANLAR İÇİN YENİ STATE EKLENDİ
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa açıldığında verileri getir
  useEffect(() => {
    fetchReservations();
    fetchAreas(); // ALANLARI DA ÇAĞIRAN FONKSİYON TETİKLENDİ
  }, []);

  // SUPABASE'DEN REZERVASYONLARI OKUMA
  const fetchReservations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('reservations').select('*');
    
    if (error) {
      console.error("Veri çekme hatası:", error);
      return;
    }

    if (data) {
      const pendingData = data.filter((r: any) => r.status === 'pending');
      const approvedData = data.filter((r: any) => r.status === 'approved').map((r: any) => ({
        ...r,
        remainingDays: 30, 
        totalDays: 30
      }));

      setPending(pendingData);
      setMembers(approvedData);
    }
    setIsLoading(false);
  };

  // SUPABASE'DEN ALANLARI OKUMA (YENİ EKLENEN FONKSİYON)
  const fetchAreas = async () => {
    const { data, error } = await supabase.from('areas').select('*').order('id');
    if (data) {
      setAreas(data); // Veritabanındaki alanları state'e atıyoruz
    } else {
      console.error("Alanlar çekilemedi", error);
    }
  };

  // SUPABASE'DE ONAYLAMA (UPDATE)
  const handleApprove = async (req: any) => {
    setPending(pending.filter(p => p.id !== req.id));
    setMembers([{...req, remainingDays: 30, totalDays: 30, status: 'approved'}, ...members]);

    const { error } = await supabase
      .from('reservations')
      .update({ status: 'approved' })
      .eq('id', req.id);

    if (error) alert("Onaylanırken hata oluştu: " + error.message);
  };

  // SUPABASE'DE GÜNCELLEME (TELEFON, SÜRE VS.)
  const handleUpdateMember = async (updatedMember: any) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    
    const { error } = await supabase
      .from('reservations')
      .update({ phone: updatedMember.phone })
      .eq('id', updatedMember.id);
      
    if (error) alert("Güncellenirken hata oluştu!");
  };

  // SUPABASE'DEN SİLME (DELETE)
  const handleDeleteMember = async (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
    
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', memberId);
      
    if (error) alert("Silinirken hata oluştu!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pending.length} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto relative h-screen">
        
        {/* Yükleniyor Göstergesi */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        )}

        {/* İŞTE DEĞİŞEN KISIM BURASI: Artık verileri içine yolluyoruz */}
        {activeTab === "dashboard" && (
          <TabDashboard 
            members={members} 
            areas={areas} 
            pendingCount={pending.length} 
          />
        )}
        
        {activeTab === "members" && (
          <TabMembers 
            pending={pending} 
            members={members} 
            onApprove={handleApprove} 
            onUpdateMember={handleUpdateMember} 
            onDeleteMember={handleDeleteMember} 
          />
        )}
        {activeTab === "areas" && <TabAreas areas={areas} />}
        {activeTab === "gate" && <TabGate />}
      </main>
    </div>
  );
}