import Topbar from "@/components/layout/Topbar";
import StructureView from "@/components/structure/StructureView";

export default function StructureTeamPage() {
  return (
    <>
      <Topbar title="Structure Team" breadcrumb="Internal / Structure Team" />
      <div className="page-content" style={{ padding: 0 }}>
        <StructureView />
      </div>
    </>
  );
}
