import Topbar from "@/components/layout/Topbar";
import ScheduleView from "@/components/schedule/ScheduleView";

export default function SchedulePage() {
  return (
    <>
      <Topbar title="Schedule" breadcrumb="Internal / Plan Workship / Schedule" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <ScheduleView />
      </div>
    </>
  );
}
