if (window.logLoad) logLoad("home.js: Loading...");
// ===== HOME / DASHBOARD PAGE =====

function buildCalendar(year, month, today) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const prev  = new Date(year, month, 0).getDate();
  let cells = [], d = 1, nd = 1;
  for (let i = 0; i < 42; i++) {
    if (i < first) {
      cells.push(`<td style="opacity:.3;font-size:.73rem;text-align:center;padding:3px">${prev - first + i + 1}</td>`);
    } else if (d > days) {
      cells.push(`<td style="opacity:.3;font-size:.73rem;text-align:center;padding:3px">${nd++}</td>`);
    } else {
      const isT = d === today;
      cells.push(`<td style="text-align:center;padding:3px"><span style="font-size:.73rem;${isT ? 'background:var(--primary);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-weight:700' : 'color:var(--text)'}">${d}</span></td>`);
      d++;
    }
  }
  let rows = '';
  for (let r = 0; r < 6; r++) {
    const sl = cells.slice(r * 7, r * 7 + 7);
    if (sl.length) rows += `<tr>${sl.join('')}</tr>`;
  }
  return rows;
}

function pageDashboard() {
  const now  = new Date();
  const h    = now.getHours();
  const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const monthsEn = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  const yr = now.getFullYear(), mo = now.getMonth(), td = now.getDate();
  const todayIso = now.toISOString().split('T')[0];
  
  // Today's tasks from Global Schedule
  const todayTasks = (window.SCHEDULE_TASKS || []).filter(t => t.date === todayIso);

  const rev  = (window.COST_DATA?.projects || []).reduce((s,p)=>s+(p.rev || 0),0);
  const cost = window.COST_DATA?.summary?.total || 0;
  const gp   = rev - cost;
  const eff  = rev > 0 ? (gp/rev*100).toFixed(1) : 0;
  const fmtM = v => {
    if (isNaN(v) || v === null) return "฿0";
    return v >= 1e6 ? `฿${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `฿${(v/1e3).toFixed(0)}K` : `฿0`;
  };

  const kpis = [
    { label:'Total Revenue',      val:fmtM(rev),  sub:'↑ 12.6% จากเดือนก่อน', subc:'var(--accent)', bg:'#e8efff', sc:'#2d6ef7',
      svg:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    { label:'Total Cost',         val:fmtM(cost), sub:'↑ 8.3% จากเดือนก่อน',  subc:'var(--danger)', bg:'#fee2e2', sc:'#ef4444',
      svg:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    { label:'Gross Profit',       val:fmtM(gp),   sub:'↑ 18.9% จากเดือนก่อน', subc:'var(--accent)', bg:'#e0faf3', sc:'#00c896',
      svg:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { label:'Project Efficiency (Avg.)',val:eff+'%',    sub:'↑ 6% จากเดือนก่อน',    subc:'var(--accent)', bg:'#fef3c7', sc:'#f59e0b',
      svg:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  ];

  const pipe = [
    { l:'Lead',        c:window.DATA?.pipeline?.lead?.length || 0,        col:'#6366f1', w:100 },
    { l:'Qualified',   c:window.DATA?.pipeline?.qualified?.length || 0,   col:'#3b82f6', w:82  },
    { l:'Proposal',    c:window.DATA?.pipeline?.proposal?.length || 0,    col:'#06b6d4', w:64  },
    { l:'Negotiation', c:window.DATA?.pipeline?.negotiation?.length || 0, col:'#10b981', w:48  },
    { l:'Won',         c:window.DATA?.pipeline?.won?.length || 0,         col:'#22c55e', w:34  },
  ];

  const topProj = [...(window.COST_DATA?.projects || [])].sort((a,b)=> (b.rev || 0) - (a.rev || 0)).slice(0,5);

  const svgIco = (path, col) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

  const alerts = [
    { svg: svgIco('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', 'var(--danger)'), bc:'var(--danger)', msg:'ใช้จ่ายสูงกว่าประมาณ 12%',   t:'10 นาทีที่แล้ว'    },
    { svg: svgIco('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'var(--warn)'), bc:'var(--warn)', msg:'ดำเนินการใกล้หมด 7 วัน',     t:'35 นาทีที่แล้ว'   },
    { svg: svgIco('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', 'var(--primary)'), bc:'var(--primary)', msg:'ต่ำกว่าเป้าหมาย 15%', t:'1 ชั่วโมงที่แล้ว' },
  ];

  const ql = [
    { l:'เพิ่มพนักงาน',        p:'add-employee',          c:'#6366f1', bg:'#e0e7ff', svg: svgIco('<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>', '#6366f1'), action: true },
    { l:'Cost',               p:'cost',                  c:'#8b5cf6', bg:'#f3e8ff', svg: svgIco('<path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>', '#8b5cf6') },
    { l:'Project\nProfit.',   p:'project-profitability', c:'#ef4444', bg:'#fee2e2', svg: svgIco('<path d="M3 3v18h18"/><path d="m18 17-5-5-4 4-5-5"/><path d="M14 12h4v4"/>', '#ef4444') },
    { l:'Real vs\nForecast',  p:'real-vs-forecast',      c:'#3b82f6', bg:'#dbeafe', svg: svgIco('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', '#3b82f6') },
    { l:'Sale\nPipeline',     p:'sale-pipeline',         c:'#10b981', bg:'#d1fae5', svg: svgIco('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>', '#10b981') },
    { l:'Plan\nWorkship',     p:'workship',              c:'#f59e0b', bg:'#fef3c7', svg: svgIco('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', '#f59e0b') },
    { l:'Document',           p:'sale-doc',              c:'#6366f1', bg:'#e0e7ff', svg: svgIco('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', '#6366f1') },
  ];

  const docs = [
    { name:'รายงานความคืบหน้า_พฤษภาคม_2025.pdf',         size:'2.4 MB', days:0, col:'#ef4444' },
    { name:'นำเสนอภาพรวมโครงการ DIB-Solar Farm.pptx',    size:'5.1 MB', days:1, col:'#f97316' },
    { name:'สรุปต้นทุนโครงการโกดมาว 2.xlsx',              size:'1.8 MB', days:2, col:'#22c55e' },
  ];

  // Init chart after render
  setTimeout(() => {
    if (typeof Chart === 'undefined') {
      console.warn("Dashboard: Chart.js not loaded.");
      return;
    }
    const cv = document.getElementById('dashRvF');
    if (!cv) return;
    if (Chart.getChart(cv)) Chart.getChart(cv).destroy();
    const lbs = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const rStub = [2.5, 4, 6.5, 7.8, 9.2, 10, 10.5, 13.5, 14, 15.5, 16.8, 18].map(v=>v*1e6);
    const fStub = [2.5, 3.5, 4.5, 5.2, 5.8, 6.5, 7.5, 9.2, 9.5, 10.5, 12, 13.5].map(v=>v*1e6);
    
    new Chart(cv, {
      type:'line',
      data:{ labels:lbs, datasets:[
        { label:'Real',     data:rStub, borderColor:'#6366f1', backgroundColor:'#6366f1', borderWidth:3, fill:false, tension:.4, pointRadius:0, pointHoverRadius:5 },
        { label:'Forecast', data:fStub, borderColor:'#a5b4fc', backgroundColor:'#a5b4fc', borderWidth:2, borderDash:[6,4], fill:false, tension:.4, pointRadius:0, pointHoverRadius:5 },
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ 
          legend:{ position:'top', align:'end', labels:{ font:{family:'Kanit', color:'#6b7280'}, boxWidth:30, usePointStyle:true, pointStyle:'line', padding: 15 } }, 
          datalabels:{display:false} 
        },
        scales:{ 
          y:{ 
            min:0, max:20000000, 
            ticks:{ stepSize:5000000, callback:v=>v===0?'0':(v/1e6)+'M', font:{family:'Kanit', color:'#9ca3af'}, padding:10 },
            grid:{ color:'#f3f4f6' },
            border:{ display:false }
          }, 
          x:{ 
            ticks:{ font:{family:'Kanit', color:'#9ca3af'}, padding:10 },
            grid:{ display:false },
            border:{ display:false }
          } 
        }
      }
    });
  }, 0);

  /* ── HTML ── */
  return `

<!-- KPIs -->
<div class="fade-in" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
  ${kpis.map(k=>`
  <div class="stat-card" style="flex-direction:row;align-items:center;gap:12px;padding:16px 18px">
    <div style="width:46px;height:46px;border-radius:12px;background:${k.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="${k.sc}" stroke-width="1.5" stroke-linecap="round">${k.svg}</svg>
    </div>
    <div style="min-width:0">
      <div style="font-size:.68rem;color:var(--text-3);margin-bottom:1px">${k.label}</div>
      <div style="font-size:1.3rem;font-weight:700;color:var(--text)">${k.val}</div>
      <div style="font-size:.68rem;color:${k.subc}">${k.sub}</div>
    </div>
  </div>`).join('')}
</div>

<!-- Row 2 -->
<div class="fade-in" style="display:grid; grid-template-columns:1fr 1.5fr 1fr; gap:12px; margin-bottom:18px">

  <div class="card" style="padding:16px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:.9rem;font-weight:700">Sale Pipeline</div>
      <a href="#" onclick="navigate('sale-pipeline');return false" style="font-size:.73rem;color:var(--primary);text-decoration:none">ทั้งหมด</a>
    </div>
    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:center;flex:1;min-height:260px;padding:0 10px">
      <!-- Funnel SVG -->
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
        <svg width="85%" height="200px" viewBox="0 0 100 120" preserveAspectRatio="none">
          <polygon points="0,0 100,0 90,22 10,22" fill="#6366f1" />
          <polygon points="10.8,24 89.2,24 80,46 20,46" fill="#7c8ee8" />
          <polygon points="20.8,48 79.2,48 70,70 30,70" fill="#8bb7e2" />
          <polygon points="30.8,72 69.2,72 65,94 35,94" fill="#8ecead" />
          <rect x="35" y="96" width="30" height="24" fill="#a0e1a4" />
        </svg>
      </div>
      <!-- Legend -->
      <div style="display:flex; flex-direction:column; justify-content:center; gap:18px; height:100%; padding:4px 0">
        ${[
          {l:'Lead', c: window.DATA?.pipeline?.lead?.length || 0, col:'#6366f1'},
          {l:'Qualified', c: window.DATA?.pipeline?.qualified?.length || 0, col:'#7c8ee8'},
          {l:'Proposal', c: window.DATA?.pipeline?.proposal?.length || 0, col:'#8bb7e2'},
          {l:'Negotiation', c: window.DATA?.pipeline?.negotiation?.length || 0, col:'#8ecead'},
          {l:'Won', c: window.DATA?.pipeline?.won?.length || 0, col:'#a0e1a4'}
        ].map(s=>`
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:.8rem">
          <div style="display:flex; align-items:center; gap:8px">
            <div style="width:10px;height:10px;border-radius:50%;background:${s.col}"></div>
            <span style="color:var(--text-2);font-weight:500">${s.l}</span>
          </div>
          <div style="font-weight:600;color:var(--text);font-size:.75rem">${s.c} Projects</div>
        </div>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="card" style="padding:16px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-size:.9rem;font-weight:700">Real vs Forecast</div>
      <a href="#" onclick="navigate('real-vs-forecast');return false" style="font-size:.73rem;color:var(--primary);text-decoration:none">View All</a>
    </div>
    <div style="flex:1;min-height:260px;width:100%"><canvas id="dashRvF"></canvas></div>
  </div>

  <div class="card" style="padding:16px">
    <div style="font-size:.9rem;font-weight:700;margin-bottom:8px">Workship Plan</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <button style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:1.1rem">‹</button>
      <span style="font-size:.8rem;font-weight:600">${monthsEn[mo]} ${yr}</span>
      <button style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:1.1rem">›</button>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>${['S','M','T','W','T','F','S'].map(d=>`<th style="font-size:.65rem;color:var(--text-3);font-weight:600;padding:3px;text-align:center">${d}</th>`).join('')}</tr></thead>
      <tbody>${buildCalendar(yr,mo,td)}</tbody>
    </table>
    <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
      ${todayTasks.length === 0 ? `
        <div style="padding:10px; text-align:center; color:var(--text-3); font-size:.7rem; font-style:italic">No tasks for today</div>
      ` : todayTasks.slice(0, 3).map(t => {
        const nodeCol = (typeof colorForNode === 'function') ? colorForNode(t.node) : 'var(--primary)';
        return `
        <div style="display:flex;gap:8px;font-size:.73rem">
          <div style="width:7px;height:7px;border-radius:50%;background:${nodeCol};flex-shrink:0;margin-top:3px"></div>
          <div>
            <div style="font-weight:600;color:var(--text-2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px">${t.title}</div>
            <div style="color:var(--text-3); font-size:.65rem">${t.acc || 'General'}</div>
          </div>
        </div>`;
      }).join('')}
      <a href="#" onclick="navigate('schedule');return false" style="font-size:.73rem;color:var(--primary);text-decoration:none;margin-top:2px">View Schedule →</a>
    </div>
  </div>
</div>

<!-- Row 3 -->
<div class="fade-in" style="display:grid; grid-template-columns:1.4fr 1fr; gap:12px; margin-bottom:18px">

  <div class="card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:.9rem;font-weight:700">Top Projects</div>
      <a href="#" onclick="navigate('project-profitability');return false" style="font-size:.73rem;color:var(--primary);text-decoration:none">View All</a>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="border-bottom:1px solid var(--border)">
        ${['Project','Status','Progress','GP(%)'].map(c=>`<th style="font-size:.68rem;color:var(--text-3);font-weight:600;padding:5px 6px;text-align:${c==='GP(%)'?'center':'left'}">${c}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${topProj.map(p=>{
          const gp = p.rev>0?(p.gp/p.rev*100):0;
          const bar = Math.min(100,Math.max(0,gp+40));
          const gc = gp>=20?'var(--accent)':gp>=0?'var(--warn)':'var(--danger)';
          return `<tr style="border-bottom:1px solid var(--border)">
            <td style="padding:6px;font-size:.76rem;font-weight:600;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</td>
            <td style="padding:6px"><span style="font-size:.68rem;color:var(--text-3)">${p.gp>0?'Active':'Stable'}</span></td>
            <td style="padding:6px;min-width:90px"><div style="display:flex;align-items:center;gap:5px">
              <div style="flex:1;height:5px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:${bar}%;background:var(--primary);border-radius:99px"></div></div>
              <span style="font-size:.68rem;color:var(--text-3)">${bar.toFixed(0)}%</span>
            </div></td>
            <td style="padding:6px;text-align:center"><span style="font-size:.76rem;font-weight:700;color:${gc}">${gp.toFixed(1)}%</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:.9rem;font-weight:700">Alerts & Notifications</div>
      <span style="font-size:.73rem;color:var(--primary);cursor:pointer">View All</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${(window.COST_DATA?.projects || []).slice(0,3).map((p,i)=>`
      <div style="display:flex;gap:10px;padding:10px;background:var(--surface2);border-radius:var(--radius-sm);border-left:3px solid ${(alerts[i] || {}).bc || 'var(--primary)'}">
        <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:${(alerts[i] || {}).bc || 'var(--primary)'}15;border-radius:8px;flex-shrink:0">${(alerts[i] || {}).svg || ''}</div>
        <div style="min-width:0">
          <div style="font-size:.76rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
          <div style="font-size:.7rem;color:var(--text-3);margin-top:1px">${(alerts[i] || {}).msg || 'No issues detected'}</div>
          <div style="font-size:.67rem;color:var(--text-3);margin-top:3px">${(alerts[i] || {}).t || 'Now'}</div>
        </div>
      </div>`).join('')}
      ${(window.COST_DATA?.projects || []).length === 0 ? '<div style="text-align:center; color:var(--text-3); font-size:.75rem; padding:20px">No active alerts</div>' : ''}
    </div>
  </div>
</div>

<!-- Row 4 -->
<div class="fade-in" style="display:grid; grid-template-columns:1fr 1.2fr; gap:12px">

  <div class="card" style="padding:16px;display:flex;flex-direction:column">
    <div style="font-size:.9rem;font-weight:700;margin-bottom:14px">Quick Access</div>
    <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:0 4px;flex:1;align-items:center">
      ${ql.map(q=>`<a href="#" onclick="${q.action ? 'openEmployeeModal()' : `navigate('${q.p}')`};return false"
        style="display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;transition:all .2s;min-width:65px;flex:1"
        onmouseover="this.style.transform='translateY(-3px)'"
        onmouseout="this.style.transform=''">
        <div style="width:50px;height:50px;border-radius:14px;background:${q.bg};display:flex;align-items:center;justify-content:center;transition:all .2s">
          ${q.svg}
        </div>
        <div style="font-size:.68rem;font-weight:600;color:var(--text-2);text-align:center;line-height:1.2;white-space:pre-line">${q.l}</div>
      </a>`).join('')}
    </div>
  </div>

  <div class="card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:.9rem;font-weight:700">Recent Documents</div>
      <a href="#" onclick="navigate('sale-doc');return false" style="font-size:.73rem;color:var(--primary);text-decoration:none">View All</a>
    </div>
    ${docs.map((d,i)=>`
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i<docs.length-1?'border-bottom:1px solid var(--border)':''}">
      <div style="width:36px;height:36px;border-radius:8px;background:${d.col}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${d.col}" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.76rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.name}</div>
        <div style="font-size:.68rem;color:var(--text-3);margin-top:1px">${d.days===0?'Today':d.days===1?'Yesterday':d.days+' days ago'} • ${d.size}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" style="flex-shrink:0;cursor:pointer"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </div>`).join('')}
  </div>
</div>`;
}

