import Topbar from "@/components/layout/Topbar";
import ScopeView from "@/components/legacy-pages/ScopeView";

export default function Page() {
  return (
    <>
      <Topbar title="Workship by Scope" breadcrumb="Internal / Plan Workship / Workship by Scope" />
      <div className="page-content" style={{ padding: 0 }}>
        <ScopeView />
      </div>
    </>
  );
}
