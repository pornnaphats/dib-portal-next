import Topbar from "@/components/layout/Topbar";
import QcPlanView from "@/components/legacy-pages/QcPlanView";

export default function Page() {
  return (
    <>
      <Topbar title="RealCyber Plan" breadcrumb="Internal / Plan Workship / RealCyber Plan" />
      <div className="page-content" style={{ padding: 0 }}>
        <QcPlanView />
      </div>
    </>
  );
}
