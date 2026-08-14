"use client";

import Topbar from "@/components/layout/Topbar";
import dynamic from "next/dynamic";

const HolidayView = dynamic(() => import("@/components/legacy-pages/HolidayView"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Topbar title="Public Holiday" breadcrumb="Internal / Plan Workship / Public Holiday" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <HolidayView />
      </div>
    </>
  );
}

