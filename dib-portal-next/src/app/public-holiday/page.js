import Topbar from "@/components/layout/Topbar";
import HolidayView from "@/components/legacy-pages/HolidayView";

export default function Page() {
  return (
    <>
      <Topbar title="Public Holiday" breadcrumb="Internal / Plan Workship / Public Holiday" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <HolidayView />
      </div>
    </>
  );
}
