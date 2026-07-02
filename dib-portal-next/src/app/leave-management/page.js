import Topbar from "@/components/layout/Topbar";
import LeaveManagementView from "@/components/leave-management/LeaveManagementView";

export default function LeaveManagementPage() {
  return (
    <>
      <Topbar title="Leave Management" breadcrumb="Internal / Leave Management" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <LeaveManagementView />
      </div>
    </>
  );
}
