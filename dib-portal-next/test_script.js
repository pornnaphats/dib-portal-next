const parseCSV = (csv) => {
    const result = [];
    let row = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      const next = csv[i + 1];
      if (ch === '"') {
        if (inQ && next === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === ',' && !inQ) {
        row.push(cur.trim());
        cur = '';
      } else if ((ch === '\n' || ch === '\r') && !inQ) {
        if (ch === '\r' && next === '\n') { i++; }
        row.push(cur.trim());
        if (row.some(c => c !== '')) result.push(row);
        row = [];
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur || row.length > 0) {
      row.push(cur.trim());
      result.push(row);
    }
    return result;
};
fetch('https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1919444706')
  .then(res => res.text())
  .then(text => {
    if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);
    const lData = parseCSV(text);
    if (lData.length > 1) {
      const row1 = lData[0].map(h => h.toLowerCase().trim());
      const idIdx = row1.findIndex(h => h.includes('id'));
      const nameIdx = row1.findIndex(h => h.includes('name'));
      const typeIdx = row1.findIndex(h => h.includes('type'));
      const fromIdx = row1.findIndex(h => h.includes('from') || h.includes('start'));
      const toIdx = row1.findIndex(h => h.includes('to') || h.includes('end'));
      const reasonIdx = row1.findIndex(h => h.includes('reason') || h.includes('note'));
      const statusIdx = row1.findIndex(h => h.includes('status'));
      const dayIdx = row1.findIndex(h => h.includes('day'));
      const reqDateIdx = row1.findIndex(h => h.includes('timestamp') || h.includes('time') || h.includes('วันที่ขอ') || h.includes('reques'));
      const refIdx = row1.findIndex(h => h.includes('ref') || h.includes('อ้างอิง') || h.includes('ชดเชย'));
      console.log('indices:', { idIdx, nameIdx, typeIdx, fromIdx, toIdx, reasonIdx, statusIdx, dayIdx, reqDateIdx, refIdx });

      for (let i = 1; i < 2; i++) {
          const row = lData[i];
          const fromRaw = row[fromIdx] || '';
          const toRaw = row[toIdx] || fromRaw;
          const rawReqDate = (reqDateIdx !== -1 ? row[reqDateIdx] : null) || fromRaw;
          console.log('fromRaw:', fromRaw, 'toRaw:', toRaw, 'rawReqDate:', rawReqDate);
      }
    }
  });
