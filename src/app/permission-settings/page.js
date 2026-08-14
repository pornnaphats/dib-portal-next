"use client";

import Topbar from "@/components/layout/Topbar";
import dynamic from "next/dynamic";

const PermissionSettingsView = dynamic(
  () => import("@/components/permission-settings/PermissionSettingsView"),
  { ssr: false }
);

export default function Page() {
  return (
    <>
      <Topbar title="Permission Settings" breadcrumb="Internal / Permission Settings" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <PermissionSettingsView />
      </div>
    </>
  );
}
