export function initModernOrg() {
window.showOrgEmployeeDetails = function(nodeId) {
    const sidebar = document.getElementById('teamStructureSidebar');
    if (!sidebar) return;

    // find node in org structure
    function findNode(node, id) {
      if (node.id === id) return node;
      if (node.children) {
        for (let child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    }

    let structure = null;
    try {
      structure = JSON.parse(localStorage.getItem('org_structure'));
    } catch(e) {}
    
    if (!structure) return;
    
    const node = findNode(structure, nodeId);
    if (!node) return;

    let emp = null;
    if (node.empId) {
      emp = ((window.DATA && window.DATA.employees) || []).find(e => e.id === node.empId);
    }

    const name = emp ? emp.name : (node.customName || 'Unassigned');
    const nameEn = emp ? (emp.nameEn || '') : '';
    const pos = node.title || (emp ? emp.pos : 'Unknown Position');
    const dept = node.dept || (emp ? emp.dept : '-');
    const email = emp ? emp.email : '-';
    const phone = emp ? (emp.phone || '-') : '-';
    
    let avatarHtml = '';
    if (emp && emp.avatar && emp.avatar.startsWith('http') && !emp.avatar.includes('ui-avatars.com')) {
        avatarHtml = `<img src="${emp.avatar}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin:0 auto; box-shadow:0 8px 24px rgba(0,0,0,0.12);">`;
    } else {
        const nick = (emp && emp.nickname && emp.nickname !== '-') ? emp.nickname : name.split(' ')[0];
        avatarHtml = `<div style="width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, #818cf8 0%, #635BFF 100%); color:#ffffff; display:flex; align-items:center; justify-content:center; font-family:'Prompt', sans-serif; font-weight:400; font-size:${nick.length > 5 ? '14px' : (nick.length > 3 ? '16px' : '20px')}; line-height:1.2; box-shadow:0 8px 24px rgba(99, 91, 255, 0.35); margin: 0 auto; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding:0 8px; box-sizing:border-box;">${nick}</div>`;
    }
    
    // Calculate team size (descendants)
    function countDescendants(n) {
      let count = 0;
      if (n.children) {
        count += n.children.length;
        n.children.forEach(c => count += countDescendants(c));
      }
      return count;
    }
    const teamSize = countDescendants(node);

    // Find reporting to
    let reporting = '-';
    function findParent(current, targetId) {
      if (current.children) {
        if (current.children.some(c => c.id === targetId)) return current;
        for (let child of current.children) {
          const p = findParent(child, targetId);
          if (p) return p;
        }
      }
      return null;
    }
    const parentNode = findParent(structure, nodeId);
    if (parentNode) {
       let parentEmp = parentNode.empId ? ((window.DATA && window.DATA.employees) || []).find(e => e.id === parentNode.empId) : null;
       reporting = parentEmp ? parentEmp.name : (parentNode.customName || 'Unassigned');
    }

    // Render premium slide-out sidebar details
    sidebar.innerHTML = `
      <div style="padding:40px; position:relative; font-family: 'Prompt', sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
          <h3 style="margin:0; font-size:1.1rem; font-weight:600; color:#24204D;">Employee Details</h3>
          <button onclick="document.getElementById('teamStructureSidebar').style.display='none'" 
                  style="width:36px; height:36px; border-radius:50%; background:#ffffff; border:1px solid #f1f5f9; box-shadow:0 4px 12px rgba(15, 23, 42, 0.08); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:all 0.2s;"
                  onmouseover="this.style.boxShadow='0 6px 16px rgba(15, 23, 42, 0.12)'; this.style.transform='translateY(-1px)'; this.style.color='#0f172a'"
                  onmouseout="this.style.boxShadow='0 4px 12px rgba(15, 23, 42, 0.08)'; this.style.transform='translateY(0)'; this.style.color='#64748b'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="text-align:center; margin-bottom:32px">
          ${avatarHtml}
          <h4 style="margin:16px 0 4px; font-size:1.25rem; font-weight:600; color:#24204D;">${name}</h4>
          <div style="font-size:0.85rem; color:#64748b; font-weight:400; margin-bottom: 12px;">${nameEn}</div>
          <span style="display:inline-block; padding:6px 16px; border-radius: 99px; background:#eef2ff; color:#635BFF; font-size:0.75rem; font-weight:600; letter-spacing:0.02em;">${pos}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:16px; border-top:1px solid #e2e8f0; padding-top:24px">
          <div style="display:flex; flex-direction:column; gap:4px;"><span style="color:#64748b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Reporting to</span><span style="font-weight:500; color:#24204D; font-size:0.95rem;">${reporting}</span></div>
          <div style="display:flex; flex-direction:column; gap:4px;"><span style="color:#64748b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Team Size</span><span style="font-weight:600; color:#635BFF; font-size:0.95rem;">${teamSize} members</span></div>
          <div style="display:flex; flex-direction:column; gap:4px;"><span style="color:#64748b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Email</span><span style="font-weight:500; color:#24204D; font-size:0.95rem; word-break:break-all;">${email}</span></div>
        </div>
      </div>
    `;
    sidebar.style.display = 'block';
  };

  // --- Org Tree Logic (Global) ---
  window.orgIsEditMode = false;
  
  window.orgGetDefaultStructure = function() {
     return {
        "id": "ceo",
        "title": "Director",
        "jobTitle": "Director",
        "empId": "RS004",
        "children": []
     };
  };

  window.orgLoadStructure = function() {
     let struct = window.orgStructureData;
     if (!struct) {
        try {
           struct = JSON.parse(localStorage.getItem('org_structure'));
        } catch(e) {}
     }
     if (!struct) {
        struct = window.orgGetDefaultStructure();
        window.orgSaveStructure(struct);
     }
     
     // Remove hardcoded Pattaphong Thonglamai from root node if it exists in LocalStorage
     if (struct && struct.title === 'ภัฏพงษ์ ทองละมัย') {
         struct.title = 'Director';
         window.orgSaveStructure(struct);
     }
     
     return struct;
  };

  window.orgSaveStructure = function(struct) {
     window.orgStructureData = struct;
     localStorage.setItem('org_structure', JSON.stringify(struct));
     
     const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : null;
     const supabaseKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : null;
     if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/rest/v1/org_structure?id=eq.default`, {
           method: 'POST',
           headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
           },
           body: JSON.stringify({
              id: 'default',
              structure: struct,
              updated_at: new Date().toISOString()
           })
        }).catch(err => console.error('Error saving org structure to Supabase:', err));
     }
  };

  window.orgExportStructure = function() {
     const struct = window.orgLoadStructure();
     const jsonStr = JSON.stringify(struct, null, 2);
     const modal = document.createElement('div');
     modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
     modal.innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:12px; width:600px; max-width:90%;">
           <h3 style="margin-top:0;">Export Structure Code</h3>
           <p style="font-size:0.85rem; color:#64748b;">Copy โค้ดด้านล่างนี้ไปทับในฟังก์ชัน <code>window.orgGetDefaultStructure</code> ในไฟล์ <code>pages.js</code> เพื่อตั้งเป็นโครงสร้างเริ่มต้นบนเว็บ</p>
           <textarea style="width:100%; height:300px; padding:10px; font-family:monospace; font-size:12px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:16px;">return ${jsonStr};</textarea>
           <div style="text-align:right;">
              <button onclick="this.parentNode.parentNode.parentNode.remove()" style=" background:#e2e8f0; border:none; border-radius:8px; cursor:pointer;" class="text-[12px] font-semibold px-4 py-1.5">Close</button>
           </div>
        </div>
     `;
     document.body.appendChild(modal);
  };

  window.orgAutoPopulate = function() {
     if (confirm("This will reset the current structure and put all employees under the root so you can arrange them manually. Proceed?")) {
        const struct = window.orgGetDefaultStructure();
        window.orgSaveStructure(struct);
        window.orgRenderTree();
     }
  };

  window.orgToggleEditMode = function() {
     window.orgIsEditMode = !window.orgIsEditMode;
     window.orgRenderTree();
  };

  // Move a node left (-1) or right (+1) among its siblings
  window.orgMoveNode = function(nodeId, direction) {
     const struct = window.orgLoadStructure();
     
     function findParent(node, targetId) {
        if (node.children) {
           for (let c of node.children) {
              if (c.id === targetId) return node;
              const found = findParent(c, targetId);
              if (found) return found;
           }
        }
        return null;
     }
     
     const parent = findParent(struct, nodeId);
     if (!parent || !parent.children) return;
     
     const idx = parent.children.findIndex(c => c.id === nodeId);
     if (idx === -1) return;
     
     const newIdx = idx + direction;
     if (newIdx < 0 || newIdx >= parent.children.length) return;
     
     // Swap
     const temp = parent.children[idx];
     parent.children[idx] = parent.children[newIdx];
     parent.children[newIdx] = temp;
     
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

  window.orgAddNode = function(parentId) {
     const struct = window.orgLoadStructure();
     
     function addChild(node, pId) {
        if (node.id === pId) {
           if (!node.children) node.children = [];
           node.children.push({
              id: 'node_' + Date.now() + Math.floor(Math.random() * 1000),
              empId: null,
              title: 'New Position',
              dept: node.dept || '-',
              children: []
           });
           return true;
        }
        if (node.children) {
           for (let c of node.children) {
              if (addChild(c, pId)) return true;
           }
        }
        return false;
     }
     
     addChild(struct, parentId);
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

  window.orgRemoveNode = function(nodeId) {
     const struct = window.orgLoadStructure();
     if (struct.id === nodeId) {
         alert("Cannot remove the root node.");
         return;
     }
     
     function removeChild(node, nId) {
        if (!node.children) return false;
        const idx = node.children.findIndex(c => c.id === nId);
        if (idx > -1) {
           node.children.splice(idx, 1);
           return true;
        }
        for (let c of node.children) {
           if (removeChild(c, nId)) return true;
        }
        return false;
     }
     
     removeChild(struct, nodeId);
     window.orgSaveStructure(struct);
     window.orgRenderTree();
  };

   window.orgEditNode = function(nodeId) {
     try {
         window.currentEditNodeId = nodeId;
         const struct = window.orgLoadStructure();
         
         function findNode(node, id) {
            if (node.id === id) return node;
            if (node.children) {
               for (let c of node.children) {
                  const f = findNode(c, id);
                  if (f) return f;
               }
            }
            return null;
         }
         
         const node = findNode(struct, nodeId);
         if (!node) {
             alert('Node not found: ' + nodeId);
             return;
         }
         
         // Populate Title dropdown dynamically from (window.DATA && window.DATA.employees)
         const titleSelect = document.getElementById('orgEditTitle');
         if (titleSelect && typeof window.DATA !== 'undefined' && (window.DATA && window.DATA.employees)) {
             const posOrder = ['director', 'manager', 'assistant manager', 'senior', 'junior'];
             const uniquePositions = [...new Set((window.DATA && window.DATA.employees).map(e => (e.pos || '').trim()).filter(Boolean))].sort((a, b) => {
                 const ai = posOrder.findIndex(o => a.toLowerCase().includes(o));
                 const bi = posOrder.findIndex(o => b.toLowerCase().includes(o));
                 if (ai !== -1 && bi !== -1) return ai - bi;
                 if (ai !== -1) return -1;
                 if (bi !== -1) return 1;
                 return a.localeCompare(b);
             });
             let titleOptions = '<option value="">-- กรุณาเลือกตำแหน่ง... --</option>';
             uniquePositions.forEach(p => {
                 titleOptions += `<option value="${p}" ${node.title === p ? 'selected' : ''}>${p}</option>`;
             });
             if (node.title && node.title !== 'New Position' && !uniquePositions.includes(node.title)) {
                 titleOptions += `<option value="${node.title}" selected>${node.title}</option>`;
             }
             titleSelect.innerHTML = titleOptions;
         } else if (titleSelect) {
             titleSelect.value = node.title || '';
         }
         // Department input removed
         
         window._currentEditEmpId = node.empId;
         
         window.orgRenderEmpOptions = function(query = '') {
             const empSelect = document.getElementById('orgEditEmp');
             if (!empSelect) return;
             let empOptions = '<option value="">-- เลือกพนักงาน (Unassigned) --</option>';
             if (typeof window.DATA !== 'undefined' && (window.DATA && window.DATA.employees)) {
                 const q = query.toLowerCase().trim();
                 const emps = (window.DATA && window.DATA.employees).filter(e => {
                     if (window._currentEditEmpId && window._currentEditEmpId.split(',').includes(e.id)) return true;
                     if (!q) return true;
                     return (e.id && e.id.toLowerCase().includes(q)) || 
                            (e.name && e.name.toLowerCase().includes(q)) || 
                            (e.nameEn && e.nameEn.toLowerCase().includes(q));
                 });
                 emps.forEach(e => {
                     const name = e.name + (e.nameEn ? ' (' + e.nameEn + ')' : '');
                     const isSelected = (window._currentEditEmpId && window._currentEditEmpId.split(',').includes(e.id)) ? 'selected' : '';
                     empOptions += `<option value="${e.id}" ${isSelected}>${e.id} - ${name}</option>`;
                 });
             }
             empSelect.innerHTML = empOptions;
         };
         
         const empSearchInput = document.getElementById('orgEditEmpSearch');
         if (empSearchInput) empSearchInput.value = '';
         window.orgRenderEmpOptions();
         
         const empSelect = document.getElementById('orgEditEmp');
         if (empSelect) {
             empSelect.onchange = function() {
                 window._currentEditEmpId = Array.from(this.selectedOptions).map(o => o.value).join(',');
             };
         }
         
         // Populate parent dropdown
         const parentSelect = document.getElementById('orgEditParent');
         if (parentSelect) {
             let currentParentIds = [];
             let allNodes = [];
             
             function traverseAndFindParent(n, parentId) {
                 allNodes.push(n);
                 if (n.id === nodeId && parentId) {
                     currentParentIds.push(parentId);
                 }
                 if (n.children) {
                     for (let c of n.children) {
                         traverseAndFindParent(c, n.id);
                     }
                 }
             }
             traverseAndFindParent(struct, null);

             if (currentParentIds.length === 0 && struct.id === nodeId) {
                 parentSelect.innerHTML = '<option value="">-- This is the Root Node --</option>';
                 parentSelect.disabled = true;
             } else {
                 let parentOptions = '';
                 
                 // Prevent circular reference
                 function isDescendant(n, targetId) {
                     if (!n.children) return false;
                     for (let c of n.children) {
                         if (c.id === targetId || isDescendant(c, targetId)) return true;
                     }
                     return false;
                 }
                 
                 allNodes.forEach(n => {
                     if (n.id !== nodeId && !isDescendant(node, n.id)) {
                         let empName = n.title;
                         if (n.empId && typeof window.DATA !== 'undefined' && (window.DATA && window.DATA.employees)) {
                             const ids = n.empId.split(',');
                             const emps = ids.map(id => (window.DATA && window.DATA.employees).find(x => x.id === id)).filter(Boolean);
                             if (emps.length > 0) empName = emps.map(e => e.name).join(' & ');
                         }
                         parentOptions += `<option value="${n.id}" ${currentParentIds.includes(n.id) ? 'selected' : ''}>${empName} (${n.dept || n.title})</option>`;
                     }
                 });
                 parentSelect.innerHTML = parentOptions;
                 parentSelect.disabled = false;
             }
         }
         
         document.getElementById('orgEditModal').style.display = 'flex';
     } catch (err) {
         alert('Error opening edit modal: ' + err.message);
     }
  };

  window.orgSaveEdit = function() {
     const title = document.getElementById('orgEditTitle').value;
     // Department input removed
     const empId = window._currentEditEmpId || '';
     const parentSelect = document.getElementById('orgEditParent');
     const newParentIds = parentSelect && !parentSelect.disabled ? Array.from(parentSelect.selectedOptions).map(o => o.value) : [];
     
     const struct = window.orgLoadStructure();
     
     // Variables for move logic
     let nodeToMove = null;
     
     function updateNode(node, id) {
        let updated = false;
        if (node.id === id) {
           node.title = title;
           node.empId = empId || null;
           nodeToMove = JSON.parse(JSON.stringify(node));
           updated = true;
        }
        if (node.children) {
           for (let c of node.children) {
              if (updateNode(c, id)) updated = true;
           }
        }
        return updated;
     }
     
     if (window.currentEditNodeId) {
         updateNode(struct, window.currentEditNodeId);
         
         // Handle moving node to new parent(s)
         if (nodeToMove && newParentIds.length > 0) {
             let currentParentId = null;
             function findCurrentParent(n) {
                 if (!n.children) return;
                 if (n.children.some(c => c.id === nodeToMove.id)) currentParentId = n.id;
                 for (let c of n.children) findCurrentParent(c);
             }
             findCurrentParent(struct);
             if (currentParentId !== newParentIds[0]) {
             // 1. Remove from all existing parents
             function removeFromAllParents(n) {
                 if (!n.children) return;
                 n.children = n.children.filter(c => c.id !== nodeToMove.id);
                 for (let c of n.children) {
                     removeFromAllParents(c);
                 }
             }
             removeFromAllParents(struct);
             
             // 2. Add to all new parents (first is primary, rest are extra)
             const nodeCopy = JSON.parse(JSON.stringify(nodeToMove));
             nodeCopy.extraParentIds = newParentIds.slice(1);
             let primaryAdded = false;
             
             function findAndAppend(n) {
                 if (!primaryAdded && newParentIds[0] === n.id) {
                     if (!n.children) n.children = [];
                     n.children.push(nodeCopy);
                     primaryAdded = true;
                 }
                 if (n.children) {
                     for (let c of n.children) {
                         findAndAppend(c);
                     }
                 }
             }
             findAndAppend(struct);
             }
             // Cleanup extraParentIds that are no longer valid (deleted nodes)
             // But here we just set them. We can let drawExtraLines handle missing nodes gracefully.
         }
         
         window.orgSaveStructure(struct);
         window.orgRenderTree();
     }
     document.getElementById('orgEditModal').style.display = 'none';
  };
  
  window.orgCloseModal = function() {
     document.getElementById('orgEditModal').style.display = 'none';
  };

  window.orgRenderTree = function() {
     const container = document.getElementById('orgTreeContainer');
     if (!container) return;
     const struct = window.orgLoadStructure();
     
     function countPeople(node) {
         let count = node.empId ? 1 : 0;
         if (node.children) {
             node.children.forEach(c => {
                 count += countPeople(c);
             });
         }
         return count;
     }

     function renderNode(node, level = 0, isVerticalStack = false, branchIndex = 0) {
         let emps = [];
         if (node.empId && typeof window.DATA !== 'undefined' && (window.DATA && window.DATA.employees)) {
             const ids = node.empId.split(',');
             emps = ids.map(id => (window.DATA && window.DATA.employees).find(e => e.id === id)).filter(Boolean);
         }
         let emp = emps.length > 0 ? emps[0] : null;
         
         const name = emp ? emp.name : (node.customName || 'Unassigned');
         const pos = node.title || (emp ? emp.pos : '-');
         const dept = node.dept || (emp ? emp.dept : '-');
         const totalPeople = countPeople(node);
         
         const branchColors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#ef4444'];
         const bColor = level === 0 ? '#3b82f6' : branchColors[branchIndex % branchColors.length];
         
         let editControls = '';
         if (window.orgIsEditMode) {
             editControls = `
               <div style="position:absolute; top:-12px; right:-12px; display:flex; gap:4px; z-index:10;">
                  <button onclick="event.stopPropagation(); window.orgEditNode('${node.id}')" style="background:#3b82f6; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  ${level > 0 ? `
                  <button onclick="event.stopPropagation(); window.orgRemoveNode('${node.id}')" style="background:#ef4444; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm)" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>` : ''}
               </div>
               ${level > 0 ? `
               <button onclick="event.stopPropagation(); window.orgMoveNode('${node.id}', -1)" style="position:absolute; left:-16px; top:50%; transform:translateY(-50%); background:#f59e0b; color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10; transition:all 0.15s;" title="Move Left" onmouseover="this.style.background='#d97706';this.style.transform='translateY(-50%) scale(1.15)'" onmouseout="this.style.background='#f59e0b';this.style.transform='translateY(-50%) scale(1)'">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
               </button>
               <button onclick="event.stopPropagation(); window.orgMoveNode('${node.id}', 1)" style="position:absolute; right:-16px; top:50%; transform:translateY(-50%); background:#f59e0b; color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10; transition:all 0.15s;" title="Move Right" onmouseover="this.style.background='#d97706';this.style.transform='translateY(-50%) scale(1.15)'" onmouseout="this.style.background='#f59e0b';this.style.transform='translateY(-50%) scale(1)'">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </button>` : ''}
               <button onclick="event.stopPropagation(); window.orgAddNode('${node.id}')" style="position:absolute; bottom:-14px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); z-index:10;" title="Add Subordinate">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </button>
             `;
         }


         let cardHtml = '';
         
         const isDepartment = (level >= 2) && (emp == null && emps.length === 0) && (/ฝ่าย|แผนก|ส่วน|ศูนย์|กลุ่ม|ทีม|สาขา|แผน|งาน|dept|department|division|section|team|group/i.test(pos));
         const isProfileCard = !isDepartment;

         if (isProfileCard) { 
             let cardsHtml = '';
             const peopleToRender = emps.length > 0 ? emps : [null]; // fallback for customName nodes

             peopleToRender.forEach((p, idx) => {
                 let avatarHtml = '';
                 const size = 42;
                 const pName = p ? p.name : (node.customName || 'Unassigned');
                 const pPos = (node.title && node.title !== 'New Position') ? node.title : (p ? p.pos : pos);

                 if (p && p.avatar && p.avatar.startsWith('http') && !p.avatar.includes('ui-avatars.com')) {
                     avatarHtml = `<img src="${p.avatar}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:none; box-shadow:0 4px 12px rgba(0,0,0,0.08);">`;
                 } else {
                     const posBg = typeof getPosBgColor === 'function' ? getPosBgColor(pPos) : '#93c5fd';
                     const posText = typeof getPosTextColor === 'function' ? getPosTextColor(pPos) : '#000';
                     const nick = (p && p.nickname && p.nickname !== '-') ? p.nickname : pName.split(' ')[0];
                     avatarHtml = `<div style="width:${size}px; height:${size}px; border-radius:50%; background:linear-gradient(135deg, #818cf8 0%, #635BFF 100%); color:#ffffff; display:flex; align-items:center; justify-content:center; font-family:'Prompt', sans-serif; font-weight:400; font-size:${nick.length > 5 ? '9px' : (nick.length > 3 ? '11px' : '13px')}; line-height:1.2; padding:0 4px; box-sizing:border-box; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border:none; box-shadow:0 4px 12px rgba(99, 91, 255, 0.35);">${nick}</div>`;
                 }
                 
                 cardsHtml += `
                   <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:210px; padding:12px; border-radius:16px; border:1px solid #e2e8f0; position:relative; background:#ffffff; box-shadow:0 2px 6px rgba(15, 23, 42, 0.04); transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1); cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-2px)'}'; this.style.boxShadow='0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 6px rgba(15, 23, 42, 0.04)';">
                      ${peopleToRender.length === 1 ? editControls : ''}
                      <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                         ${avatarHtml}
                         <div style="text-align:left; flex:1; min-width:0;">
                            <div style="font-weight:400; font-size:0.95rem; color:#24204D; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:-0.01em;" title="${pName}">${pName}</div>
                            <div style="font-size:0.75rem; color:#8e8e93; font-weight:400; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${pPos}">${pPos}</div>
                         </div>
                      </div>
                      <div style="border-top:1px solid rgba(0,0,0,0.04); padding-top:12px; font-size:0.75rem; font-weight:600; color:#8e8e93; display:flex; align-items:center; justify-content:center; gap:6px;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          ${totalPeople} คน
                      </div>
                   </div>
                 `;
             });
             
             if (peopleToRender.length > 1) {
                 // Add horizontal connecting lines for multiple managers
                 const verticalLinesHtml = peopleToRender.map(() => 
                    `<div style="width:240px; display:flex; justify-content:center;"><div style="width:2px; height:20px; background:var(--border);"></div></div>`
                 ).join('');
                 
                 cardHtml = `
                   <div style="display:flex; flex-direction:column; align-items:center; width:max-content; margin:0 auto; position:relative; z-index:5;">
                      <!-- Absolute vertical line to guarantee connection to parent! -->
                      <div style="position:absolute; top:-20px; left:50%; width:2px; height:20px; background:var(--border); transform:translateX(-50%); z-index:10;"></div>
                      
                      <!-- Robust horizontal line in document flow -->
                      <div style="width:calc(100% - 240px); height:2px; min-height:2px; background:var(--border); flex-shrink:0;"></div>
                      
                      <!-- Vertical lines dropping to cards -->
                      <div style="display:flex; justify-content:center; gap:20px; width:100%; flex-shrink:0; min-height:20px;">
                         ${peopleToRender.map(() => 
                            `<div style="width:240px; display:flex; justify-content:center; flex-shrink:0;"><div style="width:2px; height:20px; min-height:20px; background:var(--border); flex-shrink:0;"></div></div>`
                         ).join('')}
                      </div>
                      
                      <!-- The cards row -->
                      <div style="display:flex; justify-content:center; gap:20px; position:relative; flex-shrink:0;">
                         ${editControls}
                         ${cardsHtml}
                      </div>
                      
                      <!-- Bottom connection block to children -->
                      ${node.children && node.children.length > 0 ? `
                      <div style="display:flex; flex-direction:column; align-items:center; width:100%; flex-shrink:0; margin-top:0;">
                         <!-- Vertical lines dropping from cards -->
                         <div style="display:flex; justify-content:center; gap:20px; width:100%; flex-shrink:0; min-height:20px;">
                            ${peopleToRender.map(() => 
                               `<div style="width:240px; display:flex; justify-content:center; flex-shrink:0;"><div style="width:2px; height:20px; min-height:20px; background:var(--border); flex-shrink:0;"></div></div>`
                            ).join('')}
                         </div>
                         <!-- Horizontal line gathering them -->
                         <div style="width:calc(100% - 240px); height:2px; min-height:2px; background:var(--border); flex-shrink:0;"></div>
                      </div>
                      ` : ''}
                   </div>
                 `;
             } else {
                 cardHtml = `<div style="position:relative; z-index:5;">${cardsHtml}</div>`;
             }

         } else { 
             const bgAlpha = bColor + '15'; 
             const isSubDept = level > 2;
             const w = isSubDept ? 200 : 220;
             const p = isSubDept ? '10px 12px' : '12px 16px';
             cardHtml = `
               <div class="card org-card" onclick="if(!window.orgIsEditMode) window.showOrgEmployeeDetails('${node.id}')" style="width:${w}px; padding:${p}; border-radius:14px; border:1px solid #e2e8f0; position:relative; z-index:5; background:#ffffff; box-shadow:0 2px 6px rgba(15, 23, 42, 0.04); display:flex; flex-direction:column; align-items:flex-start; transition:all 0.3s cubic-bezier(0.25, 1, 0.5, 1); cursor:${window.orgIsEditMode ? 'default' : 'pointer'};" onmouseover="this.style.transform='${window.orgIsEditMode?'none':'translateY(-2px)'}'; this.style.boxShadow='0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 6px rgba(15, 23, 42, 0.04)';">
                  ${editControls}
                  <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; width:100%;">
                      <div style="width:28px; height:28px; border-radius: 50%; background:${bgAlpha}; color:${bColor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                          ${isSubDept 
                            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` 
                            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
                          }
                      </div>
                      <div style="font-weight:700; font-size:${isSubDept ? '0.8rem' : '0.85rem'}; color:#24204D; text-align:left; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${node.title || 'Department'}">${node.title || 'Department'}</div>
                  </div>
                  <div style="font-size:0.75rem; color:#64748b; padding-left:38px; display:flex; align-items:center; gap:6px;">
                      ${totalPeople} คน
                  </div>
               </div>
             `;
         }

         let html = `
           <li class="${isVerticalStack ? 'org-vertical-li' : 'org-horizontal-li'} ${level === 0 ? 'org-root-li' : ''}" style="position:relative; ${isVerticalStack ? '' : 'flex:0 0 auto;'} text-align:center; transition:all 0.5s;">
              <div id="node-${node.id}" class="org-node-container" style="position:relative; display:inline-block; width:100%;">
                 <div style="display:flex; justify-content:center;">
                    ${cardHtml}
                 </div>
              </div>
         `;
         
         if (node.children && node.children.length > 0) {
             const willBeVertical = false; 
             html += `<ul class="${willBeVertical ? 'org-vertical-ul' : 'org-horizontal-ul'}" style="position:relative; padding-top:20px; display:flex; ${willBeVertical ? 'flex-direction:column; align-items:center;' : 'justify-content:center;'} margin:0; padding-left:0; list-style:none;">`;
             
             if (willBeVertical) {
                 html += `<div class="org-vertical-line" style="position:absolute; top:0; bottom:0; left:50%; width:2px; background:var(--border); transform:translateX(-50%); z-index:0;"></div>`;
             }
             
             node.children.forEach((c, idx) => {
                 const childBranchIndex = level === 0 ? idx : branchIndex;
                 html += renderNode(c, level + 1, willBeVertical, childBranchIndex);
             });
             html += `</ul>`;
         }
         html += `</li>`;
         return html;
     }
     
     container.innerHTML = `<div class="org-tree-wrapper" style="display:inline-block; transform-origin:top center; transition:all 0.2s; position:relative;"><svg id="org-extra-lines" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;"></svg><ul style="position:relative; display:table; margin:0 auto; padding-left:0; list-style:none; z-index:1;">${renderNode(struct, 0, false, 0)}</ul></div>`;
     
     // Update Edit Mode Button text
     const btnToggle = document.getElementById('btnToggleOrgEdit');
     if (btnToggle) {
         if (window.orgIsEditMode) {
             btnToggle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M18 6L6 18M6 6l12 12"></path></svg> Exit Edit Mode';
             btnToggle.style.background = '#fef2f2';
             btnToggle.style.color = '#ef4444';
             btnToggle.style.border = 'none';
         } else {
             btnToggle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg> Edit Structure';
             btnToggle.style.background = 'transparent';
             btnToggle.style.color = '#24204D';
             btnToggle.style.border = 'none';
         }
     }

     // Draw extra lines for multiple parents
     setTimeout(() => {
         const svg = document.getElementById('org-extra-lines');
         const wrapper = document.querySelector('.org-tree-wrapper');
         if (!svg || !wrapper) return;
         
         svg.innerHTML = '';
         
         const wrapperRect = wrapper.getBoundingClientRect();
         
         function findNodesWithExtraParents(n, list) {
             if (n.extraParentIds && n.extraParentIds.length > 0) {
                 list.push(n);
             }
             if (n.children) {
                 for (let c of n.children) {
                     findNodesWithExtraParents(c, list);
                 }
             }
         }
         
         const extraList = [];
         findNodesWithExtraParents(struct, extraList);
         
         extraList.forEach(child => {
             const childEl = document.getElementById('node-' + child.id);
             if (!childEl) return;
             const childRect = childEl.getBoundingClientRect();
             const zoom = window.orgCurrentZoom || 1;
             const childX = (childRect.left + childRect.width / 2 - wrapperRect.left) / zoom;
             const childY = (childRect.top - wrapperRect.top) / zoom; // top center of child card
             
             child.extraParentIds.forEach(parentId => {
                 const parentEl = document.getElementById('node-' + parentId);
                 if (!parentEl) return;
                 const parentRect = parentEl.getBoundingClientRect();
                 const parentX = (parentRect.left + parentRect.width / 2 - wrapperRect.left) / zoom;
                 const parentY = (parentRect.bottom - wrapperRect.top) / zoom; // bottom center of parent card
                 
                 // draw path using orthogonal lines to match regular tree
                 const midY = (parentY + childY) / 2;
                 const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                 path.setAttribute('d', `M ${parentX} ${parentY} L ${parentX} ${midY} L ${childX} ${midY} L ${childX} ${childY}`);
                 path.setAttribute('fill', 'none');
                 path.setAttribute('stroke', '#cbd5e1'); // solid border color
                 path.setAttribute('stroke-width', '2');
                 svg.appendChild(path);
             });
         });
     }, 100);
  };

  window.pageStructureTeam = function() {
    window.currentPage = 'structure-team';
    
    // CSS to attach directly
    const styleId = 'org-tree-style';
    let _styleEl = document.getElementById(styleId);
    if (!_styleEl) {
        _styleEl = document.createElement('style');
        _styleEl.id = styleId;
        document.head.appendChild(_styleEl);
    }
    _styleEl.innerHTML = `
          .org-tree-wrapper ul {
            position: relative;
          }
          /* Horizontal Tree Styles */
          .org-horizontal-li {
            position: relative;
            padding: 20px 10px 0 10px;
          }
          .org-horizontal-li::before {
            content: '';
            position: absolute;
            top: 0;
            right: calc(50% + 1px);
            border-top: 2px solid var(--border);
            width: calc(50% - 1px);
            height: 20px;
          }
          .org-horizontal-li::after {
            content: '';
            position: absolute;
            top: 0;
            left: calc(50% - 1px);
            border-top: 2px solid var(--border);
            border-left: 2px solid var(--border);
            width: calc(50% + 1px);
            height: 20px;
          }
          .org-horizontal-li:only-child::after { display: none; } .org-horizontal-li:only-child::before { content: ''; position: absolute; top: 0; left: 50%; width: 2px; height: 20px; background: var(--border); transform: translateX(-50%); border: none; display: block; }
          .org-root-li::before, .org-root-li::after { display: none !important; } .org-horizontal-li:first-child::before, .org-horizontal-li:last-child::after {
            border: 0 none;
          }
          .org-horizontal-li:last-child::before {
            border-right: 2px solid var(--border);
            border-radius: 0 5px 0 0;
          }
          .org-horizontal-li:first-child::after {
            border-radius: 5px 0 0 0;
          }
          .org-horizontal-ul::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            border-left: 2px solid var(--border);
            width: 0;
            height: 20px;
            transform: translateX(-50%);
          }
          /* Vertical Tree Styles */
          .org-vertical-li {
            position: relative;
            padding: 20px 0 0 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .org-vertical-ul {
             position: relative;
             width: 100%;
          }
          /* Edit Modal Overlay */
          .org-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
          }
          .org-modal-content {
            background: #fff;
            padding: 24px;
            border-radius: 16px;
            width: 400px;
            max-width: 90%;
            box-shadow: var(--shadow-lg);
          }
          .org-modal-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--text);
          }
          .org-input-group {
            margin-bottom: 16px;
            text-align: left;
          }
          .org-input-group label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-2);
            margin-bottom: 6px;
          }
          .org-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-family: 'Prompt', sans-serif;
            font-size: 0.9rem;
            outline: none;
            box-sizing: border-box;
          }
          .org-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary)15;
          }
          .org-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
          }
          /* Thin horizontal scrollbar for org scroll wrapper */
          #orgScrollWrapper::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          #orgScrollWrapper::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.03);
            border-radius: 99px;
          }
          #orgScrollWrapper::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 99px;
          }
          #orgScrollWrapper::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
          #orgScrollWrapper {
            scrollbar-width: thin;
            scrollbar-color: #94a3b8 transparent;
          }
        `;
    
    if (typeof window.orgCurrentZoom === 'undefined') {
        window.orgCurrentZoom = 1;
        window.orgApplyZoom = function() {
            const wrapper = document.querySelector('.org-tree-wrapper');
            const label = document.getElementById('orgZoomLabel');
            if (wrapper) {
                // native zoom
                wrapper.style.zoom = window.orgCurrentZoom;
                // fallback for some firefox versions
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && !CSS.supports("zoom", "1")) {
                    wrapper.style.transform = `scale(${window.orgCurrentZoom})`;
                }
            }
            if (label) {
                label.innerText = Math.round(window.orgCurrentZoom * 100) + '%';
            }
        };
        window.orgZoomIn = function() {
            window.orgCurrentZoom = Math.min(window.orgCurrentZoom + 0.1, 2);
            window.orgApplyZoom();
        };
        window.orgZoomOut = function() {
            window.orgCurrentZoom = Math.max(window.orgCurrentZoom - 0.1, 0.3);
            window.orgApplyZoom();
        };
        window.orgZoomReset = function() {
            window.orgCurrentZoom = 1;
            window.orgApplyZoom();
        };
        window.orgZoomFit = function() {
            const wrapper = document.querySelector('.org-tree-wrapper');
            const scrollWrap = document.getElementById('orgScrollWrapper');
            if (wrapper && scrollWrap) {
                window.orgCurrentZoom = 1;
                window.orgApplyZoom();
                setTimeout(() => {
                    const wWidth = wrapper.offsetWidth;
                    const sWidth = scrollWrap.clientWidth;
                    if (wWidth > 0 && sWidth > 0) {
                        const scale = (sWidth - 40) / wWidth;
                        window.orgCurrentZoom = Math.max(0.2, Math.min(scale, 1));
                        window.orgApplyZoom();
                    }
                }, 10);
            }
        };
        
        const originalRender = window.orgRenderTree;
        if (originalRender && !originalRender.isZoomWrapped) {
            window.orgRenderTree = function() {
                const scrollWrap = document.getElementById('orgScrollWrapper');
                let scrollX = scrollWrap ? scrollWrap.scrollLeft : 0;
                let scrollY = scrollWrap ? scrollWrap.scrollTop : 0;
                originalRender();
                window.orgApplyZoom();

                  // Center the scroll area on the director (root node)
                  setTimeout(() => {
                      const scrollWrap = document.getElementById('orgScrollWrapper');
                      if (scrollWrap) {
                          if (!window._orgInitialZoomDone) { window.orgZoomFit(); window._orgInitialZoomDone = true; scrollWrap.scrollTop = 0; } else { scrollWrap.scrollLeft = scrollX; scrollWrap.scrollTop = scrollY; }
                      }
                  }, 50);

            };
            window.orgRenderTree.isZoomWrapped = true;
        }
    }

    setTimeout(() => {
        if (window.currentPage === 'structure-team' && window.orgRenderTree) window.orgRenderTree();
    }, 100);
    
    const totalEmployees = (window.DATA && window.DATA.employees) ? window.DATA.employees.length : 0;
    
    return `
      <div class="fade-in" style="padding:20px; font-family: 'Prompt', sans-serif;">
        
        <div style="position:relative; background:#ffffff; border-radius:20px; box-shadow:0 12px 40px -10px rgba(108,92,231,0.15); border:1px solid rgba(108,92,231,0.1); overflow:hidden;">
            <!-- Toolbar Controls (Edit & Zoom Combined) - above scroll area -->
            <div style="position:sticky; top:0; z-index:50; background:rgba(255,255,255,0.9); backdrop-filter:blur(10px); padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:none;">
               <div style="display:flex; align-items:center; gap:12px;">
                  <span style="background:#eef2ff; color:#635BFF; padding:6px 16px; border-radius:99px; font-size:0.85rem; font-weight:600; box-shadow:0 2px 4px rgba(99,91,255,0.1);">Total ${totalEmployees} members</span>
               </div>
               <div style="display:flex; align-items:center; background:#fff; padding:4px 8px; border-radius:99px; border:none; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
               
               <button id="btnToggleOrgEdit" onclick="window.orgToggleEditMode()" style="background:transparent; color:#24204D; border:none; outline:none; border-radius:99px; display:flex; align-items:center; cursor:pointer; transition:all 0.2s; padding:6px 16px; font-size:12px; font-weight:600; white-space:nowrap;" onmouseover="this.style.background=window.orgIsEditMode?'#fee2e2':'#f1f5f9'" onmouseout="this.style.background=window.orgIsEditMode?'#fef2f2':'transparent'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; flex-shrink:0;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  Edit Structure
               </button>
               
               <div style="width:1px; height:20px; background:#e2e8f0; margin:0 4px;"></div>
               
               <div style="display:inline-flex; gap:2px; align-items:center;">
                   <button onclick="window.orgZoomIn()" style="width:32px; height:32px; background:transparent; color:#24204D; border:none; outline:none; border-radius:99px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Zoom In">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   <button onclick="window.orgZoomOut()" style="width:32px; height:32px; background:transparent; color:#24204D; border:none; outline:none; border-radius:99px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Zoom Out">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   <div style="width:1px; height:18px; background:#e2e8f0; margin:0 4px;"></div>
                   <button onclick="window.orgZoomReset()" style="background:transparent; color:#24204D; border:none; outline:none; border-radius:99px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; padding:6px 16px; font-size:12px; font-weight:600; white-space:nowrap;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Reset Zoom">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                      <span id="orgZoomLabel">100%</span>
                   </button>
                   <div style="width:1px; height:18px; background:#e2e8f0; margin:0 4px;"></div>
                   <button onclick="window.orgZoomFit()" style="background:transparent; color:#24204D; border:none; outline:none; border-radius:99px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; padding:6px 16px; font-size:12px; font-weight:600; white-space:nowrap;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Fit to Screen">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                      แสดงทั้งหมด
                   </button>
               </div>
               </div>
            </div>

            <div id="orgScrollWrapper" style="overflow: auto; height: calc(100vh - 200px); padding-bottom: 60px;">
               <div id="orgTreeContainer" style="display:inline-block; min-width: 100%; text-align:center; padding-top: 30px;">
                  <!-- Tree renders here -->
               </div>
            </div>
        </div>
        
        <!-- Sidebar Container Element -->
        <div id="teamStructureSidebar" style="display:none; position:fixed; top:90px; right:24px; width:400px; height:auto; max-height:calc(100vh - 120px); background:#fff; border-radius:24px; border:1px solid #e2e8f0; box-shadow:0 20px 40px -10px rgba(15,23,42,0.12), 0 8px 16px -4px rgba(15,23,42,0.06); z-index:1000; overflow-y:auto; animation:slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"></div>
        
        <!-- Edit Modal Overlay -->
        <div class="org-modal-overlay" id="orgEditModal">
           <div class="org-modal-content">
              <div class="org-modal-title">แก้ไขตำแหน่ง</div>
              
              <div class="org-input-group">
                 <label>ชื่อตำแหน่ง</label>
                 <select id="orgEditTitle" class="org-input"></select>
              </div>
              
              <!-- Department input removed -->
              
              <div class="org-input-group">
                 <label>มอบหมายพนักงาน <small style="color:#94a3b8; font-weight:normal;">(กดปุ่ม Ctrl หรือ Cmd ค้างไว้ เพื่อเลือกหลายคน หรือกรณี Co-Heads)</small></label>
                 <div style="position:relative; margin-bottom:8px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute; left:10px; top:50%; transform:translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="orgEditEmpSearch" placeholder="ค้นหาชื่อพนักงานที่ต้องการมอบหมาย..." class="org-input" style="padding-left:32px; font-size:0.85rem; background:#f8fafc;" onkeyup="window.orgRenderEmpOptions(this.value)">
                 </div>
                 <select id="orgEditEmp" class="org-input" multiple style="height:100px;">
                    <!-- Options populated by JS -->
                 </select>
              </div>
              
              <div class="org-input-group">
                 <label>รายงานตรงต่อ (หัวหน้า)</label>
                 <select id="orgEditParent" class="org-input">
                    <!-- Options populated by JS -->
                 </select>
              </div>
              
              <div class="org-modal-actions">
                 <button onclick="window.orgCloseModal()" class="btn btn-outline" style="font-family:'Kanit', sans-serif;">ยกเลิก</button>
                 <button onclick="window.orgSaveEdit()" class="btn btn-primary" style="font-family:'Kanit', sans-serif; min-width:120px; justify-content:center;">บันทึกข้อมูล</button>
              </div>
           </div>
        </div>
      </div>
    `;
  }
}