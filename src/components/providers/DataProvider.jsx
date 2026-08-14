"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export default function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState({ employees: [], pagePermissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Only fetch data if logged in

    const fetchData = async () => {
      try {
        let employees = [];
        let pagePermissions = [];
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          const [resEmp, resPerms] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/employees?select=*&limit=1000`, {
              headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            }),
            fetch(`${supabaseUrl}/rest/v1/page_permissions?select=*`, {
              headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            }).catch(() => null)
          ]);

          if (resEmp && resEmp.ok) {
            const rawEmployees = await resEmp.json();
            employees = rawEmployees.map(row => ({
              id: row.id,
              name: row.name || 'No Name',
              nameEn: row.name_en || '',
              nickname: row.nickname || '-',
              pos: row.position || '-',
              dept: row.team || '-',
              team: row.team || '-',
              position: row.position || '-',
              email: row.email || '-',
              shift: row.shift || '-',
              offdays: row.offdays || row.dayoff || '-',
              dayoff: row.offdays || row.dayoff || '-',
              birthdate: row.birthdate || '-',
              empType: row.emp_type || '-',
              status: row.status || 'active'
            }));
          }

          if (resPerms && resPerms.ok) {
            pagePermissions = await resPerms.json();
          }
        }

        setData({ employees, pagePermissions });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);



  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}
