// ===== SUPER ADMINS =====
window.SUPER_ADMINS = [
    'pornnaphat.s@realsmart.co.th',
    'nawaporn.i@realsmart.co.th',
    'tatsaporn.a@realsmart.co.th',
    'thanakorn.p@realsmart.co.th'
];
// ===== GOOGLE AUTHENTICATION =====
function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch(e) { return null; }
}

window.handleCredentialResponse = function(response) {
    const token = response.credential;
    const payload = parseJwt(token);
    if (!payload || !payload.email) {
        const errorMsg = document.getElementById('loginErrorMsg');
        if(errorMsg) {
            errorMsg.textContent = "Authentication failed. Invalid token.";
            errorMsg.style.display = 'block';
        }
        return;
    }
    
    sessionStorage.setItem('dib_user_token', token);
    sessionStorage.setItem('dib_user_info', JSON.stringify(payload));
    applyLoginState(payload);
};

function applyLoginState(payload) {
    const overlay = document.getElementById('googleLoginOverlay');
    if (overlay) overlay.style.display = 'none';
    
    window._loggedInUser = payload;
    
    const avatarEl = document.querySelector('.tb-avatar');
    if (avatarEl) {
        let initials = 'US';
        if (payload.name) {
            const parts = payload.name.trim().split(/\s+/);
            initials = parts.length >= 2 
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
                : payload.name.substring(0, 2).toUpperCase();
        }
        avatarEl.innerHTML = `<img src="${payload.picture}" referrerpolicy="no-referrer" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" title="${payload.name} (${payload.email})" onerror="var p=this.parentNode; p.style.background='#6d66f1'; p.innerText='${initials}';">`;
        avatarEl.style.padding = '0';
        avatarEl.style.background = 'transparent';
    }
    
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl && window.currentPage === 'dashboard') {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        pageTitleEl.textContent = `${greeting}, ${payload.name}`;
    }
    
    // Toggle Admin menus
    const isAdmin = window.SUPER_ADMINS && payload.email && window.SUPER_ADMINS.includes(payload.email.toLowerCase());
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });
    
    if (typeof window.applyPermissions === 'function') {
        window.applyPermissions();
    }
    
    // Instant navigate if cached permissions exist (provides immediate skeleton loader)
    if (window.DATA && window.DATA.permissions && Object.keys(window.DATA.permissions).length > 0) {
        if (typeof navigate === 'function') {
            navigate(window.currentPage || 'structure-team');
        }
    }

    if (typeof window.syncAllData === 'function') {
        window.syncAllData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedInfo = sessionStorage.getItem('dib_user_info');
    if (savedInfo) {
        try {
            const payload = JSON.parse(savedInfo);
            applyLoginState(payload);
        } catch(e) {}
    } else {
        const overlay = document.getElementById('googleLoginOverlay');
        if (overlay) overlay.style.display = 'flex';
    }
});

window.toggleUserMenu = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

window.handleLogout = function() {
    sessionStorage.removeItem('dib_user_token');
    sessionStorage.removeItem('dib_user_info');
    location.reload();
};

document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('userMenuWrapper');
    const dropdown = document.getElementById('userDropdown');
    if (wrapper && dropdown && dropdown.style.display !== 'none') {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
});

window.applyPermissions = function() {
    let permMap = window.DATA && window.DATA.permissions ? window.DATA.permissions : {};
    try {
        const localPerms = localStorage.getItem('dib_custom_permissions');
        if (localPerms) permMap = JSON.parse(localPerms);
    } catch(e) { }

        const payload = window._loggedInUser;
    if (!payload) return;

    // Super Admin Bypass
    if (window.SUPER_ADMINS && window.SUPER_ADMINS.includes(payload.email.toLowerCase())) {
        document.querySelectorAll('.nav-item').forEach(el => el.style.display = '');
        document.querySelectorAll('.nav-group').forEach(group => group.style.display = '');
        document.querySelectorAll('.nav-section').forEach(sec => sec.style.display = '');
        return;
    }

    let userRoleKeys = [payload.email.toLowerCase()];
    if (window.DATA.employees) {
        const emp = window.DATA.employees.find(e => 
            (e.email && e.email.toLowerCase() === payload.email.toLowerCase()) || 
            (e['อีเมล'] && e['อีเมล'].toLowerCase() === payload.email.toLowerCase()) ||
            (e.name && e.name.toLowerCase() === payload.name.toLowerCase()) ||
            (e.nameEn && e.nameEn.toLowerCase() === payload.name.toLowerCase())
        );
        if (emp) {
            if (emp.pos) userRoleKeys.push(emp.pos.toLowerCase());
            if (emp.dept) userRoleKeys.push(emp.dept.toLowerCase());
        }
    }

    let userPermissions = null;
    for (let key of userRoleKeys) {
        if (permMap[key]) {
            userPermissions = permMap[key];
            break;
        }
    }

    if (!userPermissions || Object.keys(userPermissions).length === 0) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.nav-group').forEach(group => group.style.display = 'none');
        document.querySelectorAll('.nav-section').forEach(sec => {
            if (!sec.classList.contains('admin-only')) {
                sec.style.display = 'none';
            }
        });
        return;
    }

    document.querySelectorAll('.nav-item').forEach(el => {
        const page = el.dataset.page;
        if (!page || page === 'settings') return;
        if (userPermissions[page.toLowerCase()]) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });

    document.querySelectorAll('.nav-group').forEach(group => {
        const hasVisibleChildren = Array.from(group.querySelectorAll('.nav-item.sub')).some(el => el.style.display !== 'none');
        if (hasVisibleChildren) {
            group.style.display = '';
        } else {
            const header = group.querySelector('.nav-item:not(.sub)');
            if (header && header.style.display !== 'none') {
                group.style.display = '';
            } else {
                group.style.display = 'none';
            }
        }
    });

    document.querySelectorAll('.nav-section').forEach(sec => {
        const hasVisibleItem = Array.from(sec.querySelectorAll('.nav-item')).some(el => el.style.display !== 'none');
        if (hasVisibleItem) {
            sec.style.display = '';
        } else {
            sec.style.display = 'none';
        }
    });
};

window.checkPermission = function(pageKey) {
    const payload = window._loggedInUser;
    
    if (pageKey === 'settings') {
        if (!payload) return false;
        if (window.SUPER_ADMINS && window.SUPER_ADMINS.includes(payload.email.toLowerCase())) {
            return true;
        }
        return false;
    }

    let permMap = window.DATA && window.DATA.permissions ? window.DATA.permissions : {};
    try {
        const localPerms = localStorage.getItem('dib_custom_permissions');
        if (localPerms) permMap = JSON.parse(localPerms);
    } catch(e) { }

    if (!payload) return true;

    // Super Admin Bypass
    if (window.SUPER_ADMINS && window.SUPER_ADMINS.includes(payload.email.toLowerCase())) {
        return true;
    }

    let userRoleKeys = [payload.email.toLowerCase()];
    if (window.DATA.employees) {
        const emp = window.DATA.employees.find(e => 
            (e.email && e.email.toLowerCase() === payload.email.toLowerCase()) || 
            (e['อีเมล'] && e['อีเมล'].toLowerCase() === payload.email.toLowerCase()) ||
            (e.name && e.name.toLowerCase() === payload.name.toLowerCase()) ||
            (e.nameEn && e.nameEn.toLowerCase() === payload.name.toLowerCase())
        );
        if (emp) {
            if (emp.pos) userRoleKeys.push(emp.pos.toLowerCase());
            if (emp.dept) userRoleKeys.push(emp.dept.toLowerCase());
        }
    }

    let userPermissions = null;
    for (let key of userRoleKeys) {
        if (permMap[key]) {
            userPermissions = permMap[key];
            break;
        }
    }

    if (!userPermissions || Object.keys(userPermissions).length === 0) {
        return false;
    }
    return userPermissions[pageKey.toLowerCase()] === true;
};


// ===== APP CONTROLLER =====
window._pageRegistry = {
  'dashboard': { title: 'Overview', breadcrumb: 'Overview', fn: 'pageDashboard' },
  'cost': { title: 'Cost', breadcrumb: 'Accounting & Financial / Cost', fn: 'pageCost' },
  'project-profitability': { title: 'Project Profitability', breadcrumb: 'Accounting & Financial / Cost / Profitability', fn: 'pageProjectProfitability' },
  'real-vs-forecast': { title: 'Real vs Forecast', breadcrumb: 'Accounting & Financial / Cost / Comparison', fn: 'pageRealVsForecast' },
  'project-efficiency': { title: 'Project Efficiency', breadcrumb: 'Accounting & Financial / Cost / Efficiency', fn: 'pageProjectEfficiency' },
  'procurement': { title: 'Procurement', breadcrumb: 'Accounting & Financial / Procurement', fn: 'pageProcurement' },
  'sale-pipeline': { title: 'Sale Pipeline', breadcrumb: 'Sale & Commercial / Pipeline', fn: 'pageSalePipeline' },
  'cost-estimate': { title: 'Cost Estimate', breadcrumb: 'Sale & Commercial / Cost Estimate', fn: 'pageCostEstimate' },
  'sale-support': { title: 'Sale Support', breadcrumb: 'Sale & Commercial / Support', fn: 'pageSaleSupport' },
  'sale-doc': { title: 'Sale Document', breadcrumb: 'Sale & Commercial / Document', fn: 'pageSaleDoc' },
  'company-system': { title: 'Department System', breadcrumb: 'Internal Management / Department System', fn: 'pageCompanySystem' },
  'learning-skills': { title: 'Learning Skills', breadcrumb: 'Internal Management / Learning Skills', fn: 'pageLearningSkills' },
  'career-path': { title: 'Career Path', breadcrumb: 'Internal Management / Career Path', fn: 'pageCareerPath' },
  'core-values': { title: 'Core Values', breadcrumb: 'Internal Management / Core Values', fn: 'pageCoreValues' },
  'product-service': { title: 'Product & Service', breadcrumb: 'Internal Management / Product & Service', fn: 'pageProductService' },
  'structure-team': { title: 'Structure & Team', breadcrumb: 'Internal Management / Structure & Team', fn: 'pageStructureTeam' },
  'employee': { title: 'Employee Detail', breadcrumb: 'Internal Management / Employee Detail', fn: 'pageEmployee' },
  'leave-management': { title: 'Leave Management', breadcrumb: 'Internal Management / Leave Management', fn: 'pageLeaveManagement' },
  'workship': { title: 'Plan Workship', breadcrumb: 'Internal / Plan Workship', fn: 'pageWorkship' },
  'schedule': { title: 'Schedule', breadcrumb: 'Internal / Plan Workship / Schedule', fn: 'pageSchedule' },
  'project-scope-portal': { title: 'Workship by Scope', breadcrumb: 'Internal / Plan Workship Scope', fn: 'renderPremiumScopeDashboard' },
  'qc-realcyber-plan': { title: 'RealCyber Plan', breadcrumb: 'Internal / Plan Workship / RealCyber Plan', fn: 'renderQCWorkPlanDashboard' },
  'public-holiday': { title: 'Public Holiday', breadcrumb: 'Internal / Plan Workship / Public Holiday', fn: 'pagePublicHoliday' },
  'settings': { title: 'Settings', breadcrumb: 'System / Settings', fn: 'pageSettings' }
};

window.getFirstAllowedPage = function() {
    if (typeof window.checkPermission !== 'function') return 'structure-team';

    // Then check all nav items in order
    const navItems = document.querySelectorAll('.nav-item');
    for (let i = 0; i < navItems.length; i++) {
        const page = navItems[i].dataset.page;
        if (page && page !== 'settings' && window.checkPermission(page)) {
            return page;
        }
    }
    
    if (!window.DATA || !window.DATA.employees || window.DATA.employees.length === 0) {
        return null;
    }
    
    if (window.DATA && window.DATA.permissions && Object.keys(window.DATA.permissions).length > 0) {
        return 'no-permission';
    }
    return null;
};

window.navigate = function(pageKey) {
    if (!pageKey) return;
    
    if (pageKey === 'no-permission') {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-3);"><div style="margin-bottom:16px;"><i data-lucide="shield-alert" style="width:48px; height:48px; color:#cbd5e1;"></i></div><h2 style="font-size:1.2rem; font-weight:600; color:var(--text); margin-bottom:8px;">ยินดีต้อนรับสู่ระบบ DIB Portal</h2><p>ระบบตรวจสอบไม่พบสิทธิ์การเข้าถึงเมนูต่างๆ ของคุณ<br>กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดสิทธิ์การใช้งานครับ</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    // Check permission
    if (typeof window.checkPermission === 'function') {
        if (!window.checkPermission(pageKey)) {
            // Fallback to the first allowed page
            const fallbackPage = typeof window.getFirstAllowedPage === 'function' ? window.getFirstAllowedPage() : null;
            
            if (!fallbackPage) {
                const content = document.getElementById('pageContent');
                if (content) {
                    content.innerHTML = '<div style="padding:60px; text-align:center; color:var(--text-3);"><div style="display:inline-block; animation:rotation 1s linear infinite; margin-bottom:16px;"><i data-lucide="loader-2" style="width:28px; height:28px; color:var(--primary);"></i></div><br>กำลังตรวจสอบสิทธิ์การเข้าถึง...</div>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
                return;
            }
            
            // Prevent infinite loop if getFirstAllowedPage returns the same blocked page
            if (fallbackPage === pageKey) {
                const content = document.getElementById('pageContent');
                if (content) content.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-3);">You do not have permission to view any pages.</div>';
                return;
            }
            
            window.navigate(fallbackPage);
            return;
        }
    }

    const pageDef = window._pageRegistry[pageKey];
    if (!pageDef) return;

    // Update active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const link = document.querySelector(`.nav-item[data-page="${pageKey}"]`);
    if (link) link.classList.add('active');

    // Update headers
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = pageDef.title;
    
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (breadcrumbEl) breadcrumbEl.textContent = pageDef.breadcrumb;

    // Execute function
    const content = document.getElementById('pageContent');
    if (content) content.innerHTML = ''; // clear previous content
    
    window.currentPage = pageKey;

    if (typeof window[pageDef.fn] === 'function') {
        try {
            const result = window[pageDef.fn]();
            if (result && typeof result === 'string') {
                if (content) content.innerHTML = result;
            }
            if (typeof window.lucide !== 'undefined' && content) {
                setTimeout(() => window.lucide.createIcons({ root: content }), 10);
            }
        } catch (e) {
            console.error("Page Render Error:", e);
            if (content) content.innerHTML = `<div style="padding:40px; color:var(--danger); text-align:center;"><strong>Error rendering ${pageDef.title}</strong><br><pre style="text-align:left; margin-top:16px; font-size:12px; background:var(--surface2); padding:16px; border-radius:8px;">${e.stack || e.message || e}</pre></div>`;
        }
    } else {
        // As requested: Redirect to Learning Skills instead of showing Under Construction
        window.navigate('structure-team');
    }
};

// Global click delegation for sidebar navigation
document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        e.preventDefault();
        
        // Toggle expanded class if it's a group header
        if (!navItem.classList.contains('sub')) {
            const group = navItem.closest('.nav-group');
            if (group) {
                group.classList.toggle('expanded');
            }
        }

        const page = navItem.dataset.page;
        if (page) window.navigate(page);
    }
});

// Toggle Notifications
window.toggleNotifications = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('notiDropdown');
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) userDropdown.style.display = 'none'; // close user dropdown

    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
};

window.markAllRead = function(e) {
    e.stopPropagation();
    const items = document.querySelectorAll('.noti-item');
    items.forEach(el => el.classList.remove('unread'));
    const badge = document.getElementById('notiBadge');
    if (badge) badge.style.display = 'none';
};

document.addEventListener('click', function(e) {
    const notiWrapper = document.getElementById('notiWrapper');
    const notiDropdown = document.getElementById('notiDropdown');
    if (notiWrapper && notiDropdown && notiDropdown.style.display === 'block') {
        if (!notiWrapper.contains(e.target)) {
            notiDropdown.style.display = 'none';
        }
    }
});

// Render Notifications
window.renderNotifications = function() {
    const container = document.getElementById('notiListContainer');
    const badge = document.getElementById('notiBadge');
    if (!container) return;

    let notifications = [];

    // Holiday Check
    const today = new Date();
    for (let i = 0; i <= 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        
        let holidayName = null;
        if (window.DATA && window.DATA.public_holidays) {
            const hMatch = window.DATA.public_holidays.find(h => {
                if (!h.date) return false;
                const hparts = String(h.date).split('/');
                if (hparts.length >= 2) {
                    const hm = parseInt(hparts[1], 10);
                    const hd = parseInt(hparts[0], 10);
                    return hm === (d.getMonth() + 1) && hd === d.getDate();
                }
                return false;
            });
            if (hMatch) holidayName = hMatch.name;
        }

        if (holidayName) {
            if (!notifications.find(n => n.subject === 'วันหยุดนักขัตฤกษ์' && n.desc.includes(holidayName))) {
                notifications.push({
                    type: 'holiday',
                    icon: 'calendar-days',
                    subject: 'วันหยุดนักขัตฤกษ์',
                    desc: `ในอีก ${i} วัน จะถึงวันหยุด: ${holidayName}`,
                    time: `${i} วันข้างหน้า`,
                    unread: true
                });
            }
        }
    }

    notifications = notifications.slice(0, 15);

    if (notifications.length === 0) {
        container.innerHTML = `
            <div style="padding: 30px 20px; text-align: center; color: var(--text-3);">
                <i data-lucide="bell-off" style="width: 32px; height: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin:0; font-size: 0.85rem;">ไม่มีการแจ้งเตือนใหม่</p>
            </div>
        `;
        if (badge) badge.style.display = 'none';
    } else {
        container.innerHTML = notifications.map(n => `
            <a href="#" class="noti-item ${n.unread ? 'unread' : ''}">
                <div class="noti-icon ${n.type}"><i data-lucide="${n.icon}"></i></div>
                <div class="noti-content">
                    <h4 class="noti-subject">${n.subject}</h4>
                    <p class="noti-desc">${n.desc}</p>
                    <p class="noti-time">${n.time}</p>
                </div>
            </a>
        `).join('');

        if (badge) {
            badge.textContent = notifications.length;
            badge.style.display = 'block';
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};
// Hook into syncAllData
const originalSyncAllData = window.syncAllData;
if (typeof originalSyncAllData === 'function') {
    window.syncAllData = async function() {
        await originalSyncAllData.apply(this, arguments);
        if (typeof window.loadPermissions === 'function') {
            await window.loadPermissions();
        }
        if (typeof window.applyPermissions === 'function') {
            window.applyPermissions();
        }
        if (window.renderNotifications) window.renderNotifications();

        // Re-navigate after permissions are loaded, in case the initial navigation failed
        if (typeof window.navigate === 'function') {
            const fallback = typeof window.getFirstAllowedPage === 'function' ? window.getFirstAllowedPage() : 'structure-team';
            window.navigate(window.currentPage && window.checkPermission(window.currentPage) ? window.currentPage : fallback);
        }
    };
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.renderNotifications) window.renderNotifications();
    }, 1500); // slight delay to allow data to load
});