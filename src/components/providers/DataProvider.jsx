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
            }).catch((err) => {
              console.warn("Failed to fetch employees from Supabase:", err);
              return null;
            }),
            fetch(`${supabaseUrl}/rest/v1/page_permissions?select=*`, {
              headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            }).catch((err) => {
              console.warn("Failed to fetch page permissions from Supabase:", err);
              return null;
            })
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
            if (typeof window !== 'undefined' && employees.length > 0) {
              try {
                localStorage.setItem('cached_employees', JSON.stringify(employees));
              } catch (e) {}
            }
          }

          if (resPerms && resPerms.ok) {
            const remotePerms = await resPerms.json();
            let savedLocalPerms = null;
            if (typeof window !== 'undefined') {
              try {
                const cached = localStorage.getItem('cached_page_permissions');
                if (cached) savedLocalPerms = JSON.parse(cached);
              } catch (e) {}
            }

            if (savedLocalPerms && savedLocalPerms.length > 0) {
              pagePermissions = savedLocalPerms;
            } else if (remotePerms && remotePerms.length > 0) {
              pagePermissions = remotePerms;
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('cached_page_permissions', JSON.stringify(remotePerms));
                } catch (e) {}
              }
            }
          }
        }

        if (typeof window !== 'undefined') {
          if (employees.length === 0) {
            try {
              const cached = localStorage.getItem('cached_employees');
              if (cached) employees = JSON.parse(cached);
            } catch (e) {}
          }
          if (pagePermissions.length === 0) {
            try {
              const cachedPerms = localStorage.getItem('cached_page_permissions');
              if (cachedPerms) pagePermissions = JSON.parse(cachedPerms);
            } catch (e) {}
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
