const mockData = [
  { id: 'LR-05052026-01', name: 'พรนภัส ทวีทรัพย์', type: 'ลาป่วย', start_date: '2026-05-08', end_date: '2026-05-08', days: 1, status: 'pending', note: 'test' }
];

const formatDateTH = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
    } catch(e) {
        return dateStr;
    }
};

const mapped = mockData.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    fromDate: r.start_date,
    toDate: r.end_date,
    startRaw: r.start_date,
    endRaw: r.end_date,
    start: formatDateTH(r.start_date),
    end: formatDateTH(r.end_date),
    requestDate: formatDateTH(r.request_date),
    refDate: r.ref_date ? formatDateTH(r.ref_date) : '-',
    days: parseFloat(r.days) || 1,
    reason: r.note || '-',
    note: r.note || '-',
    status: (r.status || 'pending').toLowerCase(),
    approvedBy: r.approved_by || '-'
}));

console.log(mapped);
