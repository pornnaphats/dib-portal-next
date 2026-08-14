"use client";

import Topbar from "@/components/layout/Topbar";
import dynamic from "next/dynamic";

const ScopeView = dynamic(() => import("@/components/legacy-pages/ScopeView"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Topbar title="Workship by Scope" breadcrumb="Internal / Plan Workship / Workship by Scope" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <ScopeView />
      </div>
    </>
  );
}

