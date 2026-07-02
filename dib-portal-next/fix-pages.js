const fs = require('fs');
const pages = [
  { file: 'src/app/employee/page.js', title: 'Employee Detail', breadcrumb: 'Internal / Employee Detail', comp: 'EmployeeView', importComp: '@/components/employee/EmployeeView' },
  { file: 'src/app/project-scope-portal/page.js', title: 'Workship by Scope', breadcrumb: 'Internal / Plan Workship / Workship by Scope', comp: 'ScopeView', importComp: '@/components/legacy-pages/ScopeView' },
  { file: 'src/app/public-holiday/page.js', title: 'Public Holiday', breadcrumb: 'Internal / Plan Workship / Public Holiday', comp: 'HolidayView', importComp: '@/components/legacy-pages/HolidayView' },
  { file: 'src/app/qc-realcyber-plan/page.js', title: 'RealCyber Plan', breadcrumb: 'Internal / Plan Workship / RealCyber Plan', comp: 'QcPlanView', importComp: '@/components/legacy-pages/QcPlanView' },
  { file: 'src/app/workship/page.js', title: 'Plan Workship', breadcrumb: 'Internal / Plan Workship', comp: 'WorkshipView', importComp: '@/components/legacy-pages/WorkshipView' }
];

pages.forEach(p => {
  const code = `import Topbar from "@/components/layout/Topbar";
import ${p.comp} from "${p.importComp}";

export const metadata = {
  title: "${p.title} | DIB Portal",
};

export default function Page() {
  return (
    <>
      <Topbar title="${p.title}" breadcrumb="${p.breadcrumb}" />
      <div className="page-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", padding: 0 }}>
        <${p.comp} />
      </div>
    </>
  );
}
`;
  fs.writeFileSync(p.file, code);
  console.log('Updated', p.file);
});
