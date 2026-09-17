"use client";

import Topbar from "@/components/layout/Topbar";
import dynamic from "next/dynamic";

const QcImportView = dynamic(() => import("@/components/legacy-pages/QcImportView"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Topbar title="Import File" breadcrumb="Internal / Plan Workship / Import File" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0, overflow: "hidden" }}>
        <QcImportView />
      </div>
    </>
  );
}
