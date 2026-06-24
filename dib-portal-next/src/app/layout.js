import { Kanit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AuthProvider from "@/components/providers/AuthProvider";
import DataProvider from "@/components/providers/DataProvider";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata = {
  title: "DIB Portal",
  description: "Department Portal System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${kanit.className} antialiased`}>
      <body className="min-h-screen bg-[#f4f7fe] text-[#1a2035] flex overflow-x-hidden">
        <AuthProvider>
          <DataProvider>
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
