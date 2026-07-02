import Topbar from "@/components/layout/Topbar";
import EmployeeView from "@/components/employee/EmployeeView";

export const metadata = {
  title: "Employee Detail | DIB Portal",
};

export default function Page() {
  return (
    <>
      <Topbar title="Employee Detail" breadcrumb="Internal / Employee Detail" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <EmployeeView />
      </div>
    </>
  );
}
