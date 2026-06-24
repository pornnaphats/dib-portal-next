window._tempPermissions = {};
window._rolesList = [];
window._navTree = [];

window.pageSettings = function() {
    // 1. Gather Roles
    let roles = [];
        if (window.DATA && window.DATA.employees) {
        const positions = window.DATA.employees.map(e => e.pos).filter(Boolean).filter(p => p !== '-');
        roles = [...new Set([...positions])].map(r => r.trim());
        
        // Define desired sorting order
        const rank = {
            
            'director': 2,
            'manager': 3,
            'assistant manager': 4,
            'senior': 5,
            'junior': 6
        };
        
        roles.sort((a, b) => {
            const rankA = rank[a.toLowerCase()] || 99;
            const rankB = rank[b.toLowerCase()] || 99;
            if (rankA !== rankB) return rankA - rankB;
            return a.localeCompare(b);
        });
    }
    window._rolesList = roles;

    // 2. Initialize temp permissions
    window._tempPermissions = JSON.parse(JSON.stringify((window.DATA && window.DATA.permissions) ? window.DATA.permissions : {}));
    
    // Ensure all roles exist in tempPermissions
    roles.forEach(r => {
        if (!window._tempPermissions[r.toLowerCase()]) window._tempPermissions[r.toLowerCase()] = {};
    });

    // 3. Build Nav Tree from Sidebar HTML
    window._navTree = [];
    document.querySelectorAll('.nav-section').forEach(section => {
        if (section.classList.contains('admin-only')) return; // skip settings

        let sectionObj = {
            label: section.querySelector('.nav-label') ? section.querySelector('.nav-label').innerText.trim() : 'General',
            groups: []
        };

        Array.from(section.children).forEach(child => {
            if (child.classList.contains('nav-item') && !child.classList.contains('sub')) {
                const textEl = child.querySelector('.nav-text');
                sectionObj.groups.push({
                    main: { id: child.dataset.page.toLowerCase(), label: textEl ? textEl.innerText.trim() : child.dataset.page },
                    subs: []
                });
            } else if (child.classList.contains('nav-group')) {
                let mainItem = null;
                let subs = [];
                Array.from(child.children).forEach(gc => {
                    if (gc.classList.contains('nav-item')) {
                        const textEl = gc.querySelector('.nav-text');
                        const itemObj = { id: gc.dataset.page.toLowerCase(), label: textEl ? textEl.innerText.trim() : gc.dataset.page };
                        if (gc.classList.contains('sub')) {
                            subs.push(itemObj);
                        } else {
                            mainItem = itemObj;
                        }
                    }
                });
                if (mainItem || subs.length > 0) {
                    sectionObj.groups.push({ main: mainItem, subs: subs });
                }
            }
        });
        
        if (sectionObj.groups.length > 0) {
            window._navTree.push(sectionObj);
        }
    });

    setTimeout(() => window.renderPermissionTree(), 50);

    return `
    <div style="padding:24px; max-width:1200px; margin:0 auto; font-family:'Kanit',sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <div>
                <h1 style="font-size:1.8rem; font-weight:700; color:var(--text); margin-bottom:8px;">Permission Settings</h1>
                <p style="color:var(--text-3);">จัดการสิทธิ์การเข้าถึงของทุกตำแหน่งได้จากที่นี่</p>
            </div>
            <div>
                <button onclick="window.savePermissions()" class="btn btn-primary" style="display:flex; align-items:center; gap:8px; position:sticky; top:20px; z-index:100; box-shadow:0 4px 12px rgba(79, 70, 229, 0.3);">
                    <i data-lucide="save" style="width:18px; height:18px;"></i> บันทึกสิทธิ์ (Save)
                </button>
            </div>
        </div>

        <div id="treeContainer" style="display:flex; flex-direction:column; gap:24px;"></div>

        <!-- Code Generator Modal -->
        <div id="permCodeModal" style="display:none; margin-top:24px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:20px;">
            <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:12px; color:#0f172a; display:flex; align-items:center; gap:8px;">
                <i data-lucide="check-circle-2" style="color:#10b981;"></i> Configuration Generated Successfully!
            </h3>
            <p style="font-size:0.9rem; color:#475569; margin-bottom:16px;">
                คัดลอกรหัสด้านล่างนี้ แล้วนำไปวางส่งให้บอทในช่องแชท เพื่อให้บอทนำไปฝังในระบบให้ทุกคนใช้งานได้ครับ
            </p>
            <div style="position:relative;">
                <textarea id="permCodeText" readonly style="width:100%; height:150px; padding:12px; font-family:monospace; font-size:0.85rem; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#334155; resize:none;"></textarea>
                <button onclick="window.copyPermCode()" style="position:absolute; top:12px; right:12px; background:#4f46e5; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <i data-lucide="copy" style="width:14px; height:14px;"></i> Copy
                </button>
            </div>
        </div>
    </div>
    `;
};

window.renderPermissionTree = function() {
    const treeContainer = document.getElementById('treeContainer');
    if (!treeContainer) return;

    let html = '';

    window._rolesList.forEach((role, rIdx) => {
        const roleKey = role.toLowerCase();
        const perms = window._tempPermissions[roleKey] || {};

        html += `
        <div style="background:#fff; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); border:1px solid #e2e8f0; overflow:hidden;">
            <div style="background:#f1f5f9; padding:16px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="font-size:1.2rem; font-weight:700; color:#0f172a; margin:0;">${role}</h2>
            </div>
            <div style="padding:24px; display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:24px;">
        `;

        window._navTree.forEach((section, sIdx) => {
            html += `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                <h3 style="font-size:1rem; font-weight:700; color:#475569; margin-bottom:12px; border-bottom:2px solid #cbd5e1; padding-bottom:8px;">${section.label}</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
            `;

            section.groups.forEach((group, gIdx) => {
                if (group.main) {
                    const isMainChecked = perms[group.main.id] ? 'checked' : '';
                    html += `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="chk_${rIdx}_${sIdx}_${gIdx}_main" data-role="${roleKey}" data-page="${group.main.id}" ${isMainChecked} onchange="window.handleCheckboxChange(this, true)" style="width:18px; height:18px; accent-color:var(--primary); cursor:pointer;">
                        <label for="chk_${rIdx}_${sIdx}_${gIdx}_main" style="font-weight:600; color:#334155; cursor:pointer; font-size:0.95rem;">${group.main.label}</label>
                    </div>
                    `;
                }
                
                if (group.subs && group.subs.length > 0) {
                    html += `<div style="display:flex; flex-direction:column; gap:8px; padding-left:28px; border-left:2px solid #e2e8f0; margin-left:8px; margin-top:4px;">`;
                    group.subs.forEach((sub, subIdx) => {
                        const isSubChecked = perms[sub.id] ? 'checked' : '';
                        html += `
                        <div style="display:flex; align-items:center; gap:10px;">
                            <input type="checkbox" id="chk_${rIdx}_${sIdx}_${gIdx}_sub_${subIdx}" class="sub-chk_${rIdx}_${sIdx}_${gIdx}" data-role="${roleKey}" data-page="${sub.id}" ${isSubChecked} onchange="window.handleCheckboxChange(this, false)" style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
                            <label for="chk_${rIdx}_${sIdx}_${gIdx}_sub_${subIdx}" style="color:#64748b; cursor:pointer; font-size:0.9rem;">${sub.label}</label>
                        </div>
                        `;
                    });
                    html += `</div>`;
                }
            });

            html += `</div></div>`;
        });

        html += `</div></div>`;
    });

    treeContainer.innerHTML = html;
};

window.handleCheckboxChange = function(el, isMain) {
    const role = el.dataset.role;
    const page = el.dataset.page;
    const checked = el.checked;

    // Update state
    if (!window._tempPermissions[role]) window._tempPermissions[role] = {};
    window._tempPermissions[role][page] = checked;

    // If main group is checked/unchecked, auto check/uncheck all its sub-items
    if (isMain) {
        // Find the wrapper and all sub-checkboxes
        const wrapper = el.closest('div').nextElementSibling;
        if (wrapper && wrapper.style.borderLeft) {
            const subCheckboxes = wrapper.querySelectorAll('input[type="checkbox"]');
            subCheckboxes.forEach(subCb => {
                subCb.checked = checked;
                window._tempPermissions[role][subCb.dataset.page] = checked;
            });
        }
    }
};

window.savePermissions = function() {
    // Generate Code from state
    const codeStr = JSON.stringify(window._tempPermissions, null, 2);
    
    // Save to localStorage so it applies instantly on this device
    localStorage.setItem('dib_custom_permissions', codeStr);

    // Apply instantly to the sidebar
    if (window.applyPermissions) window.applyPermissions();

    const modal = document.getElementById('permCodeModal');
    const textArea = document.getElementById('permCodeText');
    if (modal && textArea) {
        modal.style.display = 'block';
        textArea.value = codeStr;
        modal.scrollIntoView({ behavior: 'smooth' });
    }
};

window.copyPermCode = function() {
    const textArea = document.getElementById('permCodeText');
    if (textArea) {
        textArea.select();
        document.execCommand('copy');
        alert('Copied to clipboard! นำไปส่งในช่องแชทได้เลยครับ');
    }
};