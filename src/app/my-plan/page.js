import Topbar from "@/components/layout/Topbar";
import MyPlanView from "@/components/my-plan/MyPlanView";

export default function MyPlanPage() {
  return (
    <>
      <Topbar title="My Plan" breadcrumb="Internal / My Plan" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflowY: "auto", padding: "24px 28px" }}>
        <MyPlanView />
      </div>
    </>
  );
}
