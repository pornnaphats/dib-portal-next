import fs from 'fs';
import https from 'https';

async function migrate() {
    console.log('Fetching from Google Sheets...');
    const url = 'https://docs.google.com/spreadsheets/d/1a5nLyclYZwFUlauF4lXNwv9X2i_6xQQSFJCnOXuyJVE/export?format=csv&gid=1919444706';
    
    const fetchCsv = () => new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                https.get(res.headers.location, (res2) => {
                    res2.on('data', chunk => data += chunk);
                    res2.on('end', () => resolve(data));
                }).on('error', reject);
            } else {
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }
        }).on('error', reject);
    });

    const csvData = await fetchCsv();
    const rows = csvData.split('\n').map(r => r.split(','));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    const idIdx = headers.findIndex(h => h.includes('id'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const typeIdx = headers.findIndex(h => h.includes('type'));
    const fromIdx = headers.findIndex(h => h.includes('from') || h.includes('start'));
    const toIdx = headers.findIndex(h => h.includes('to') || h.includes('end'));
    const reasonIdx = headers.findIndex(h => h.includes('reason') || h.includes('note'));
    const statusIdx = headers.findIndex(h => h.includes('status'));
    const dayIdx = headers.findIndex(h => h.includes('day'));
    const refIdx = headers.findIndex(h => h.includes('ref') || h.includes('อ้างอิง') || h.includes('ชดเชย'));

    const parseThaiDateToIso = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const mMap = {'ม.ค.':1, 'ก.พ.':2, 'มี.ค.':3, 'เม.ย.':4, 'พ.ค.':5, 'มิ.ย.':6, 'ก.ค.':7, 'ส.ค.':8, 'ก.ย.':9, 'ต.ค.':10, 'พ.ย.':11, 'ธ.ค.':12};
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length >= 3) {
            const d = parseInt(parts[0]);
            const m = mMap[parts[1]];
            const y = parseInt(parts[2]) - 543;
            if (!isNaN(d) && m !== undefined && !isNaN(y)) {
                return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            }
        }
        return null;
    };

    const records = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5 || !row[nameIdx]) continue;
        const startRaw = row[fromIdx];
        const endRaw = row[toIdx] || startRaw;
        
        records.push({
            id: row[idIdx] || `LV-${Date.now()}-${i}`,
            name: row[nameIdx],
            type: row[typeIdx] || 'ลาป่วย',
            start_date: parseThaiDateToIso(startRaw),
            end_date: parseThaiDateToIso(endRaw) || parseThaiDateToIso(startRaw),
            days: parseFloat(row[dayIdx]) || 1,
            status: (row[statusIdx] || 'pending').toLowerCase().replace('\r', ''),
            note: row[reasonIdx] || '-',
            ref_date: refIdx !== -1 && row[refIdx] ? parseThaiDateToIso(row[refIdx]) : null
        });
    }

    const validRecords = records.filter(r => r.start_date);
    console.log(`Found ${validRecords.length} records. Uploading to Supabase...`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jfxesvvswpgeaxhhnnyt.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeGVzdnZzd3BnZWF4aGhubnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQyNTQsImV4cCI6MjA5Nzg2MDI1NH0.odfG9O7eHCF6nUlPFo3TxFLpPl_ncF7loxlR8i0x14E';
    
    const res = await fetch(`${supabaseUrl}/rest/v1/leave_requests`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(validRecords)
    });

    if (res.ok) {
        console.log('Migration successful!');
    } else {
        console.error('Migration failed:', await res.text());
    }
}
migrate().catch(console.error);
