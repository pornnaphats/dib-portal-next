(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,194342,(e,o,t)=>{let a=Error("Could not parse module '[project]/src/components/legacy-pages/legacyHolidayLogic.js'\n\nUnexpected token `ident`. Expected `}`");throw a.code="MODULE_UNPARSABLE",a},197744,e=>{"use strict";var o=e.i(843476),t=e.i(271645),a=e.i(531903);e.i(767668),e.i(194342),e.s(["default",0,function(){let n=(0,t.useRef)(null),i=(0,t.useRef)(!1);return(0,t.useEffect)(()=>{if(!i.current){i.current=!0,document.body.dataset.page="public-holiday",window.DATA||(window.DATA={employees:[],scheduleTasks:[],public_holidays:[]}),window.WS_DATA||(window.WS_DATA={members:[],tasks:[],accounts:[]});try{let e=localStorage.getItem("cached_public_holidays");if(e){window.HOLIDAY_LIST=JSON.parse(e),window.DATA.public_holidays=window.HOLIDAY_LIST;let o={};window.HOLIDAY_LIST.forEach(e=>{if(e.date&&e.name){let t=e.date.split("/");3===t.length&&(o[`${parseInt(t[1])}-${parseInt(t[0])}`]=e.name)}}),window.HOLIDAYS=o}let o=localStorage.getItem("holiday_templates");o&&(window.HOLIDAY_TEMPLATES=JSON.parse(o));let t=localStorage.getItem("cached_employees");t&&(window.DATA.employees=JSON.parse(t))}catch(e){console.warn("Failed to load cached data:",e)}if(window.lucide={...a,createIcons:e=>e&&null===e.root?null:a.createIcons({icons:a.icons,...e})},window.navigate=(e,o={})=>{if(localStorage.setItem("holiday_current_view",e),"public-holiday"===e&&n.current){let e="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E",t=()=>{if(n.current&&"function"==typeof window.pagePublicHoliday){let e=document.getElementById("holidayGridScroll"),o=e?e.scrollLeft:0,t=e?e.scrollTop:0,a=window.scrollY||document.documentElement.scrollTop;n.current.innerHTML=window.pagePublicHoliday(),window.lucide.createIcons();let i=document.getElementById("holidayGridScroll");i&&(i.scrollLeft=o,i.scrollTop=t),window.scrollTo(0,a)}},a=document.getElementById("holidayGridScroll");if(a&&a.scrollLeft,a&&a.scrollTop,window.scrollY||document.documentElement.scrollTop,o&&o.bypassFetch)return void t();fetch("https://jfxesvvswpgeaxhhnnyt.supabase.co/rest/v1/public_holidays?select=*&limit=500&order=date.asc",{headers:{apikey:e,Authorization:`Bearer ${e}`}}).then(e=>e.ok?e.json():[]).then(e=>{let o=[],a={};e.forEach(e=>{if(e.date&&e.name){let[t,n,i]=e.date.split("-");o.push({id:e.id,date:`${parseInt(i)}/${parseInt(n)}/${t}`,name:e.name}),a[`${parseInt(n)}-${parseInt(i)}`]=e.name}}),window.HOLIDAY_LIST=o,window.HOLIDAYS=a,window.DATA&&(window.DATA.public_holidays=o),t()}).catch(()=>t())}else if("holiday-summary"===e&&n.current)"function"==typeof window.pageHolidaySummary?(n.current.innerHTML=window.pageHolidaySummary(),window.lucide.createIcons()):window.navigate("public-holiday");else if("manage-holiday-tasks"===e&&n.current){let{name:e,date:o}=window.currentManageHoliday||{};e&&o&&"function"==typeof window.pageManageHolidayTasks?(n.current.innerHTML=window.pageManageHolidayTasks(e,o),window.lucide.createIcons()):window.navigate("public-holiday")}},n.current){let e=localStorage.getItem("holiday_current_view"),{name:o,date:t}=window.currentManageHoliday||{};"holiday-summary"===e&&"function"==typeof window.pageHolidaySummary?n.current.innerHTML=window.pageHolidaySummary():"manage-holiday-tasks"===e&&o&&t&&"function"==typeof window.pageManageHolidayTasks?n.current.innerHTML=window.pageManageHolidayTasks(o,t):"function"==typeof window.pagePublicHoliday&&(n.current.innerHTML=window.pagePublicHoliday()),window.lucide.createIcons()}requestIdleCallback(()=>{Promise.all([e.A(917393),e.A(997813)]).then(([e,o])=>{window.Chart=e.default,window.flatpickr=o.default}),e.A(432558).then(e=>{e?.fetchAndSetLegacyData&&e.fetchAndSetLegacyData().then(()=>{if(n.current){let e=localStorage.getItem("holiday_current_view"),{name:o,date:t}=window.currentManageHoliday||{};"holiday-summary"===e&&"function"==typeof window.pageHolidaySummary?n.current.innerHTML=window.pageHolidaySummary():"manage-holiday-tasks"===e&&o&&t&&"function"==typeof window.pageManageHolidayTasks?n.current.innerHTML=window.pageManageHolidayTasks(o,t):"function"==typeof window.pagePublicHoliday&&(n.current.innerHTML=window.pagePublicHoliday()),window.lucide.createIcons()}}).catch(()=>{})}).catch(()=>{});try{let e=JSON.parse(localStorage.getItem("holiday_shifts")||"[]");e.length>0&&"function"==typeof window.apiSaveHolidayShift&&(console.log("Auto-syncing localStorage shifts to Supabase..."),e.forEach(e=>{e.tasks&&Array.isArray(e.tasks)&&e.tasks.forEach(o=>{o.person&&"-"!==o.person&&window.apiSaveHolidayShift({action:"edit",id:o.id,date:e.date,holidayName:e.name,status:e.status||"upcoming",section:o.section,person:o.person,time:o.time,assignments:JSON.stringify(o.assignments||[])}).catch(()=>{})})}))}catch(e){console.error("Failed to auto-sync local shifts:",e)}},{timeout:150})}},[]),(0,o.jsxs)("div",{className:"w-full h-full bg-transparent overflow-y-hidden flex flex-col",style:{padding:"20px"},children:[(0,o.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        /* Premium Purple Theme Select Inputs */
        .select-input {
          height: 34px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 99px !important;
          padding: 0 16px !important;
          font-family: 'Kanit', sans-serif !important;
          font-size: 13px !important;
          color: #24204D !important;
          background-color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          outline: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 14px center !important;
          background-size: 14px !important;
          padding-right: 36px !important;
        }
        .select-input:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          border-color: #cbd5e1 !important;
        }
        .select-input:focus {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        button.select-input:focus {
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        button.select-input:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
        }

        /* Search Box styling */
        .search-box {
          height: 34px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 99px !important;
          padding: 0 16px !important;
          background-color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          transition: all 0.2s ease !important;
        }
        .search-box:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
        }
        .search-box:focus-within {
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
        }
        .search-box input {
          font-family: 'Kanit', sans-serif !important;
          font-size: 13px !important;
          color: #24204D !important;
        }

        /* Premium Buttons */
        .btn-primary {
          background: #635BFF !important;
          color: #ffffff !important;
          font-family: 'Kanit', sans-serif !important;
          font-weight: 600 !important;
          border-radius: 99px !important;
          height: 34px !important;
          padding: 0 20px !important;
          font-size: 13px !important;
          box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .btn-primary:hover {
          background: #5048E5 !important;
          box-shadow: 0 6px 16px rgba(99, 91, 255, 0.3) !important;
        }
      `}}),(0,o.jsx)("div",{id:"pageContent",ref:n,className:"w-full","data-page":"public-holiday"})]})}])},808331,e=>{e.n(e.i(197744))},432558,e=>{e.v(o=>Promise.all(["static/chunks/3tzmp7184jeiu.js"].map(o=>e.l(o))).then(()=>o(762008)))},917393,e=>{e.v(o=>Promise.all(["static/chunks/1d3x5fx-_5em8.js"].map(o=>e.l(o))).then(()=>o(701508)))},997813,e=>{e.v(e=>Promise.resolve().then(()=>e(211229)))}]);