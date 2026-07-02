import { Kanit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
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
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="h-screen max-h-screen bg-[#f4f7fe] text-[#1a2035] flex overflow-hidden">
        <AuthProvider>
          <DataProvider>
            <Sidebar />
            <main className="main-content" style={{ height: "100vh", overflow: "hidden" }}>
              {children}
            </main>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
