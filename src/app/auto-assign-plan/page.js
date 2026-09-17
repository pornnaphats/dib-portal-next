"use client";

import Topbar from "@/components/layout/Topbar";
import dynamic from "next/dynamic";

const QcAutoPlanView = dynamic(() => import("@/components/legacy-pages/QcAutoPlanView"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Topbar title="Auto Assign Plan" breadcrumb="Internal / Plan Workship / Auto Assign Plan" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <QcAutoPlanView />
      </div>
    </>
  );
}
