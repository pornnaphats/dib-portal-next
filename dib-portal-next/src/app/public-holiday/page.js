import Topbar from "@/components/layout/Topbar";
import HolidayView from "@/components/legacy-pages/HolidayView";

export default function Page() {
  return (
    <>
      <Topbar title="Public Holiday" breadcrumb="Internal / Plan Workship / Public Holiday" />
      <div className="page-content" style={{ padding: 0 }}>
        <HolidayView />
      </div>
    </>
  );
}
