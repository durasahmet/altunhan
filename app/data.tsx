import { Tent, Caravan, MapPin } from "lucide-react";
import React from "react";

export const rentalGroups = [
  {
    title: "Konaklama Kiralama (Eşyalı & Hazır)",
    items: [
      { id: "c1", name: "Maxi Lüx Karavan", icon: <Caravan size={24} />, packages: [{id: "1w", name: "1 Hafta", days: 7, price: 15000}, {id: "1m", name: "1 Ay", days: 30, price: 45000}, {id: "3m", name: "3 Ay", days: 90, price: 120000}, {id: "6m", name: "6 Ay", days: 180, price: 200000}, {id: "1y", name: "1 Yıl", days: 365, price: 350000}] },
      { id: "c4", name: "Mini Lüx Karavan", icon: <Caravan size={24} />, packages: [{id: "3d", name: "3 Gün", days: 3, price: 5000}, {id: "1w", name: "1 Hafta", days: 7, price: 10000}, {id: "1m", name: "1 Ay", days: 30, price: 30000}, {id: "3m", name: "3 Ay", days: 90, price: 80000}, {id: "1y", name: "1 Yıl", days: 365, price: 250000}] },
      { id: "c5", name: "Mini Standart Karavan", icon: <Caravan size={24} />, packages: [{id: "3d", name: "3 Gün", days: 3, price: 4000}, {id: "1w", name: "1 Hafta", days: 7, price: 8000}, {id: "1m", name: "1 Ay", days: 30, price: 25000}, {id: "3m", name: "3 Ay", days: 90, price: 70000}, {id: "1y", name: "1 Yıl", days: 365, price: 200000}] }
    ]
  },
  {
    title: "Alan Kiralama (Kendi Aracınız/Çadırınız İçin)",
    items: [
      { id: "c2", name: "Maxi Lüx Karavan Alanı", icon: <MapPin size={24} />, packages: [{id: "1y", name: "1 Yıl", days: 365, price: 100000}] },
      { id: "c3", name: "Mini Lüx Karavan Alanı", icon: <MapPin size={24} />, packages: [{id: "1m", name: "1 Ay", days: 30, price: 15000}, {id: "3m", name: "3 Ay", days: 90, price: 40000}, {id: "1y", name: "1 Yıl", days: 365, price: 80000}] },
      { id: "c6", name: "Kamp Alanı", icon: <Tent size={24} />, packages: [{id: "3d", name: "3 Gün", days: 3, price: 1500}, {id: "1w", name: "1 Hafta", days: 7, price: 3000}, {id: "1m", name: "1 Ay", days: 30, price: 10000}, {id: "3m", name: "3 Ay", days: 90, price: 25000}, {id: "1y", name: "1 Yıl", days: 365, price: 50000}] }
    ]
  }
];

export const parcelsData = [
    { id: "A1", category: "caravan_area", name: "Parsel A-1", available: true },
    { id: "A2", category: "caravan_area", name: "Parsel A-2 (Dolu)", available: false },
    { id: "A3", category: "caravan_area", name: "Parsel A-3", available: true },
    { id: "T1", category: "camp_area", name: "Kamp Yeri 1", available: true },
    { id: "T2", category: "camp_area", name: "Kamp Yeri 2", available: true },
    { id: "KC1", category: "rental_caravan", name: "Lüx Karavan KC-1", available: true },
];