import Topbar from "@/components/layout/Topbar";
import WorkshipView from "@/components/legacy-pages/WorkshipView";

export default function Page() {
  return (
    <>
      <Topbar title="Plan Workship" breadcrumb="Internal / Plan Workship" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <WorkshipView />
      </div>
    </>
  );
}
