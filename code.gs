function doPost(e) {
  try {
    var ssBId = "1NR-PaUK3q7LsMYNrGhmZZE80PJ6i4UXgYc7mBX6LMJ4"; // Schedule, Workship by Scope, Public holiday2, Templates
    var ssAId = "1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE"; // Detail, Leave, Public holiday

    var ssB = null;
    var ssA = null;

    var getSsB = function() {
      if (!ssB) {
        try {
          ssB = SpreadsheetApp.getActiveSpreadsheet();
          if (ssB.getId() !== ssBId) {
            ssB = SpreadsheetApp.openById(ssBId);
          }
        } catch(err) {
          ssB = SpreadsheetApp.openById(ssBId);
        }
      }
      return ssB;
    };

    var getSsA = function() {
      if (!ssA) {
        try {
          ssA = SpreadsheetApp.getActiveSpreadsheet();
          if (ssA.getId() !== ssAId) {
            ssA = SpreadsheetApp.openById(ssAId);
          }
        } catch(err) {
          ssA = SpreadsheetApp.openById(ssAId);
        }
      }
      return ssA;
    };

    var rawContent = "";
    if (e.parameter && e.parameter.payload) {
      rawContent = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      rawContent = e.postData.contents;
    }
    
    if (!rawContent) {
      return ContentService.createTextOutput("Error: No content").setMimeType(ContentService.MimeType.TEXT);
    }

    var data = JSON.parse(rawContent);
    var action = data.action;
    
    // ฟังก์ชันสกัดเหลือแต่ตัวอักษรและตัวเลข ป้องกันปัญหาการพิมพ์ผิด เว้นวรรคเกิน
    var cleanStr = function(s) {
      if (!s) return "";
      return s.toString().replace(/[^a-zA-Z0-9ก-๙]/g, '').toLowerCase();
    };

    // ==========================================
    // ACTION: update_schedule (หน้า Schedule - เพิ่ม/ย้ายงาน)
    // ==========================================
    if (action === 'update_schedule') {
      var schedSheet = getSsB().getSheetByName("Schedule");
      if (!schedSheet) return ContentService.createTextOutput("Sheet not found").setMimeType(ContentService.MimeType.TEXT);
      
      var date = data.date || "";
      var name = data.name || "";
      var project = data.project || "";
      var node = data.node || "";
      var workDetail = data.work_detail || "";
      var percentage = data.percentage || 0;
      var totalPercentage = percentage; 
      
      schedSheet.appendRow([date, name, project, node, workDetail, percentage, totalPercentage]);
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    // ==========================================
    // ACTION: delete_schedule (หน้า Schedule - ลบงาน)
    // ==========================================
    if (action === 'delete_schedule') {
      var schedSheet = getSsB().getSheetByName("Schedule");
      if (!schedSheet) return ContentService.createTextOutput("Sheet not found").setMimeType(ContentService.MimeType.TEXT);
      
      var oldName = data.old_name || "";
      var workDetail = data.work_detail || "";
      
      if (oldName !== "" && workDetail !== "") {
        var rows = schedSheet.getDataRange().getValues();
        var targetName = cleanStr(oldName);
        var targetWorkDetail = cleanStr(workDetail);
        
        for (var i = rows.length - 1; i >= 1; i--) {
          var rowName = cleanStr(rows[i][1]);
          var rowWorkDetail = cleanStr(rows[i][4]);
          
          if (rowName === targetName && rowWorkDetail === targetWorkDetail) {
            schedSheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    // ==========================================
    // ACTION: Workship Scope (หน้า Workship by Scope)
    // ==========================================
    if (action === 'add_workship_scope' || action === 'edit_workship_scope' || action === 'delete_workship_scope') {
      var targetSs = getSsB();
      var scopeSheet = targetSs.getSheetByName("Workship by Scope") || targetSs.getSheets()[0];
      
      // เพิ่มข้อมูล
      if (action === 'add_workship_scope') {
        scopeSheet.appendRow([new Date(), data.account, data.node, data.detail, data.percent]);
        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
      }

      // แก้ไขข้อมูล
      if (action === 'edit_workship_scope') {
        var rows = scopeSheet.getDataRange().getValues();
        var originalName = cleanStr(data.originalName); 
        
        for (var i = 1; i < rows.length; i++) {
          var rowDetail = cleanStr(rows[i][3]);
          if (rowDetail === originalName) { 
            scopeSheet.getRange(i + 1, 2).setValue(data.account); 
            scopeSheet.getRange(i + 1, 3).setValue(data.node);    
            scopeSheet.getRange(i + 1, 4).setValue(data.detail);  
            scopeSheet.getRange(i + 1, 5).setValue(data.percent); 
            break;
          }
        }
        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
      }

      // ลบข้อมูล
      if (action === 'delete_workship_scope') {
        var rows = scopeSheet.getDataRange().getValues();
        var targetAccount = cleanStr(data.account);
        var targetDetail = cleanStr(data.detail);
        
        for (var i = rows.length - 1; i >= 1; i--) {
          var rowAccount = cleanStr(rows[i][1]); // คอลัมน์ B: Project Name
          var rowDetail = cleanStr(rows[i][3]);  // คอลัมน์ D: Work Detail
          
          if (rowAccount === targetAccount && rowDetail === targetDetail) {
            scopeSheet.deleteRow(i + 1);
            break;
          }
        }
        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
      }
    }

    // ==========================================
    // ACTION: Delete Holiday Tasks by Date
    // ==========================================
    if (action === 'delete_by_date') {
      var targetSs = getSsB();
      var sheet = targetSs.getSheets().find(function(s) { return s.getSheetId() == 834860902; }) || targetSs.getSheetByName("Public holiday2");
      if (sheet) {
        var date = data.date || "";
        if (date !== "") {
          var rows = sheet.getDataRange().getValues();
          for (var i = rows.length - 1; i >= 1; i--) {
            if (String(rows[i][1]).trim() === date.trim()) {
              sheet.deleteRow(i + 1);
            }
          }
        }
      }
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    // ==========================================
    // ACTION: Delete QC Plan (ลบพาร์ท QC/Manual)
    // ==========================================
    if (action === 'delete_qc_plan') {
      var targetSs = getSsB();
      var sheet = targetSs.getSheets().find(function(s) { return s.getSheetId() == 465102760; }) || targetSs.getSheetByName("QC RCB");
      if (sheet) {
        var targetName = cleanStr(data.name);
        var targetQcType = cleanStr(data.qcType);
        var targetChannel = cleanStr(data.channel);
        var targetCategory = cleanStr(data.category);
        
        var rows = sheet.getDataRange().getValues();
        for (var i = rows.length - 1; i >= 1; i--) {
          var rowName = cleanStr(rows[i][1]);      // Column B: Name
          var rowQcType = cleanStr(rows[i][2]);    // Column C: QC Type
          var rowChannel = cleanStr(rows[i][3]);   // Column D: Channel
          var rowCategory = cleanStr(rows[i][4]);  // Column E: Category
          
          if (rowName === targetName && rowQcType === targetQcType && rowChannel === targetChannel && rowCategory === targetCategory) {
            sheet.deleteRow(i + 1);
          }
        }
      }
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    // ==========================================
    // ACTION: Leave / Employee Detail / Public holiday2 / QC RCB (CRUD using ID prefix)
    // ==========================================
    var id = String(data.id || "");
    if (id !== "") {
      var sheet;
      var isLeave = id.startsWith("LR-");
      var isHoliday = id.startsWith("HS-");
      var isQc = id.startsWith("QC-");
      
      if (isLeave) {
        // Find Leave sheet by GID or Name on Spreadsheet A
        var targetSs = getSsA();
        sheet = targetSs.getSheets().find(function(s) { return s.getSheetId() == 1919444706; }) || targetSs.getSheetByName("Leave");
      } else if (isHoliday) {
        var isTemplate = id.startsWith("HS-TPL-");
        var targetSs = getSsB();
        if (isTemplate) {
          sheet = targetSs.getSheetByName("Templates");
          if (!sheet) {
            sheet = targetSs.insertSheet("Templates");
            sheet.appendRow(["ID", "Section", "Time Shift", "Assignments"]);
          }
        } else {
          sheet = targetSs.getSheets().find(function(s) { return s.getSheetId() == 834860902; }) || targetSs.getSheetByName("Public holiday2");
          if (!sheet) {
            sheet = targetSs.insertSheet("Public holiday2");
            sheet.appendRow(["ID", "Date", "Holiday Name", "Status", "Section", "Person", "Time Shift", "Assignments"]);
          }
        }
      } else if (isQc) {
        var targetSs = getSsB();
        sheet = targetSs.getSheets().find(function(s) { return s.getSheetId() == 465102760; }) || targetSs.getSheetByName("QC RCB");
        if (!sheet) {
          sheet = targetSs.insertSheet("QC RCB");
          sheet.appendRow(["ID", "ผู้รับผิดชอบ", "รอบ", "ช่องทาง", "หมวด", "วันที่", "จำนวนเคส", "ต้องทำ"]);
        }
      } else {
        // Employee Detail on Spreadsheet A
        var targetSs = getSsA();
        sheet = targetSs.getSheetByName("Employee Detail") || targetSs.getSheets()[0];
      }
      
      if (!sheet) return ContentService.createTextOutput("Error: Sheet not found").setMimeType(ContentService.MimeType.TEXT);

      // Logging
      sheet.getRange("N1").setValue("LAST UPDATED: " + new Date());

      var rows = sheet.getDataRange().getValues();
      var rowIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === id.trim()) { 
          rowIndex = i + 1;
          break;
        }
      }

      var rowData;
      if (isLeave) {
        // Leave Sheet Structure
        rowData = [
          data.id, data.name, data.type, data.start, data.end, 
          data.days, data.refDate, data.status, data.approvedBy, data.requestDate, data.note
        ];
      } else if (isHoliday) {
        var isTemplate = id.startsWith("HS-TPL-");
        if (isTemplate) {
          // Template Sheet Structure (only 4 columns!)
          rowData = [
            data.id, data.section, data.time, data.assignments
          ];
        } else {
          // Holiday Sheet Structure (8 columns)
          rowData = [
            data.id, data.date, data.holidayName, data.status, data.section, data.person, data.time, data.assignments
          ];
        }
      } else if (isQc) {
        // QC Sheet Structure
        rowData = [
          data.id, data.name, data.qcType, data.channel, data.category, data.date, data.cases, data.targetCases
        ];
      } else {
        // Employee Sheet Structure
        rowData = [
          data.id, data.name, data.nameEn, data.nickname, data.email, data.birthdate,
          data.position, data.team, data.shift, data.offdays, data.empType, data.status
        ];
      }

      if (action === 'add') {
        sheet.appendRow(rowData);
      } else if (action === 'edit' && rowIndex !== -1) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else if (action === 'delete' && rowIndex !== -1) {
        sheet.deleteRow(rowIndex);
      } else if (action === 'update_ranks' && data.orderedIds) {
        var targetSs = getSsA();
        var empSheet = targetSs.getSheetByName("Employee Detail") || targetSs.getSheets()[0];
        var empRows = empSheet.getDataRange().getValues();
        for (var k = 0; k < data.orderedIds.length; k++) {
          var tid = String(data.orderedIds[k]).trim();
          for (var j = 1; j < empRows.length; j++) {
            if (String(empRows[j][0]).trim() === tid) {
              empSheet.getRange(j + 1, 13).setValue(k + 1); 
              break;
            }
          }
        }
      }
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService.createTextOutput("Error: No matched action or ID").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
