import Topbar from "@/components/layout/Topbar";

export default function Home() {
  return (
    <>
      <Topbar title="Overview" breadcrumb="Overview" />
      <div className="page-content">
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
          <h2>Welcome to DIB Portal (Next.js Version)</h2>
          <p>We are currently migrating this page...</p>
        </div>
      </div>
    </>
  );
}
