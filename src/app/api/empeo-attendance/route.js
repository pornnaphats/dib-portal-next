import { NextResponse } from "next/server";
import { google } from "googleapis";
import * as XLSX from "xlsx";

const LEGACY_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-XHUp4Qd3-TULEDQHbZmDU8hGQI_OX69fGcACVpeg_feJn4zquylze2qOM_OSZ70l/exec";

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Fallback: If Google Service Account envs are not configured, proxy the Apps Script
    if (!clientEmail || !privateKey || !folderId) {
      console.warn("Google Drive credentials not fully configured. Falling back to Google Apps Script Web App...");
      const response = await fetch(LEGACY_APPS_SCRIPT_URL, {
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      if (!response.ok) {
        throw new Error(`Apps Script fallback failed with status ${response.status}`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Connect to Google Drive API using Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // List all files in the Empeo folder matching the name format
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'Monthly_Attendance_Report' and trashed = false`,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
    });

    const files = listRes.data.files || [];
    if (files.length === 0) {
      console.warn("No Empeo files found in the Google Drive folder. Falling back to Google Apps Script Web App...");
      const response = await fetch(LEGACY_APPS_SCRIPT_URL, {
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      if (!response.ok) {
        throw new Error(`Apps Script fallback failed with status ${response.status}`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    const resultData = {};

    // Process up to the 5 most recent files
    const filesToProcess = files.slice(0, 5);

    for (const file of filesToProcess) {
      const fileId = file.id;
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // strip extension

      // Download file content as arraybuffer
      const fileRes = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );

      const buffer = Buffer.from(fileRes.data);
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert Sheet to JSON array (raw rows)
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Parse Empeo Monthly Attendance structure
      // Format of Empeo spreadsheet usually has:
      // - Headers on row 4-6 (e.g. Employee ID, Name, Days 1..31, Late, Leave Early, etc.)
      const parsedEmployees = [];
      let days = [];

      // Look for the headers row
      let headerRowIndex = -1;
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (row && row.some(cell => String(cell).includes("รหัสพนักงาน") || String(cell).includes("Employee ID"))) {
          headerRowIndex = r;
          break;
        }
      }

      if (headerRowIndex !== -1) {
        const headers = rows[headerRowIndex].map(h => String(h || "").trim());
        
        // Find columns
        const idCol = headers.findIndex(h => h.includes("รหัสพนักงาน") || h.includes("Employee ID"));
        const nameCol = headers.findIndex(h => h.includes("ชื่อ") || h.includes("Name"));
        const absentCol = headers.findIndex(h => h.includes("ขาดงาน") || h.includes("Absent"));
        const lateTimesCol = headers.findIndex(h => h.includes("สาย (ครั้ง)") || h.includes("Late (Times)"));
        const lateMinsCol = headers.findIndex(h => h.includes("สาย (นาที)") || h.includes("Late (Mins)"));
        
        // Extract day columns (usually headers showing 1, 2, 3... 31)
        // Find columns between Name/ID and summary metrics
        const dayCols = [];
        headers.forEach((h, idx) => {
          if (!isNaN(h) && parseInt(h) >= 1 && parseInt(h) <= 31) {
            dayCols.push({ day: h, colIndex: idx });
            if (!days.includes(h)) days.push(h);
          }
        });

        // Loop through data rows starting after the header
        for (let r = headerRowIndex + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[idCol] || String(row[idCol]).trim() === "") continue;

          const empId = String(row[idCol]).trim();
          const empName = String(row[nameCol] || "").trim();

          // Daily status array
          const dailyStatuses = dayCols.map(d => String(row[d.colIndex] || "").trim());

          parsedEmployees.push({
            id: empId,
            name: empName,
            absent: Number(row[absentCol]) || 0,
            lateTimes: Number(row[lateTimesCol]) || 0,
            lateMins: Number(row[lateMinsCol]) || 0,
            leaveEarlyTimes: Number(row[headers.findIndex(h => h.includes("กลับก่อน (ครั้ง)"))]) || 0,
            leaveEarlyMins: Number(row[headers.findIndex(h => h.includes("กลับก่อน (นาที)"))]) || 0,
            forgetIn: Number(row[headers.findIndex(h => h.includes("ลืมบันทึกเข้า"))]) || 0,
            forgetOut: Number(row[headers.findIndex(h => h.includes("ลืมบันทึกออก"))]) || 0,
            sickLeave: Number(row[headers.findIndex(h => h.includes("ลาป่วย"))]) || 0,
            personalLeave: Number(row[headers.findIndex(h => h.includes("ลากิจ"))]) || 0,
            vacationLeave: Number(row[headers.findIndex(h => h.includes("ลาพักร้อน"))]) || 0,
            otherLeave: Number(row[headers.findIndex(h => h.includes("ลาอื่นๆ"))]) || 0,
            daily: dailyStatuses
          });
        }
      }

      resultData[fileName] = {
        days: days,
        employees: parsedEmployees
      };
    }

    return NextResponse.json(resultData);
  } catch (error) {
    console.error("API /api/empeo-attendance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
