const fs = require('fs');

const csvPath = 'scratch/sheet_data.csv';
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

const employees = [];

// Skip headers up to line 13
for (let i = 13; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith(',รวม')) break;
    
    // Some lines are department headers like ",  แผนก 0001    ,,,,Data Intelligence RSM1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,                          ,,,,,,,,,,,,,,"
    if (line.includes('แผนก') && line.split(',').filter(x => x.trim() !== '').length <= 3) {
        continue;
    }

    // Split considering possible quotes, but this CSV is mostly simple.
    // However, names don't have commas.
    const cols = line.split(',');
    if (cols.length < 50) continue;

    const id = cols[1];
    const name = cols[3];
    
    if (!id || !name || id.trim() === '') continue;

    const stats = {
        id: id.trim(),
        name: name.trim(),
        present: cols[33] === '-' ? 0 : parseInt(cols[33]) || 0,
        absent: cols[34] === '-' ? 0 : parseInt(cols[34]) || 0,
        lateTimes: cols[35] === '-' ? 0 : parseInt(cols[35]) || 0,
        lateMins: cols[36] === '-' ? 0 : parseInt(cols[36]) || 0,
        leaveEarlyTimes: cols[37] === '-' ? 0 : parseInt(cols[37]) || 0,
        leaveEarlyMins: cols[38] === '-' ? 0 : parseInt(cols[38]) || 0,
        forgetIn: cols[39] === '-' ? 0 : parseInt(cols[39]) || 0,
        forgetOut: cols[40] === '-' ? 0 : parseInt(cols[40]) || 0,
        sickLeave: cols[41] === '-' ? 0 : parseFloat(cols[41]) || 0, // In days/hours
        personalLeave: cols[43] === '-' ? 0 : parseFloat(cols[43]) || 0,
        vacationLeave: cols[45] === '-' ? 0 : parseFloat(cols[45]) || 0,
        otherLeave: cols[46] === '-' ? 0 : parseFloat(cols[46]) || 0,
    };
    employees.push(stats);
}

const jsContent = `window.DATA = window.DATA || {};\nwindow.DATA.empeoReport = ${JSON.stringify(employees, null, 2)};\n`;
fs.writeFileSync('js/empeo_data.js', jsContent);
console.log('Successfully generated js/empeo_data.js with ' + employees.length + ' records.');
