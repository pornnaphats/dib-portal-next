const fs = require('fs');
let c = fs.readFileSync('js/pages.js', 'utf8');

// The regex matches from <!-- Right Sidebar --> down to the closing div of the page layout
const rightSidebarRegex = /<!-- Right Sidebar -->\s*<div style="display:flex; flex-direction:column; gap:20px">\s*([\s\S]*?)<\/div>\s*<\/div>\s*`;/m;

const match = c.match(rightSidebarRegex);
if (match) {
    let birthdayBlock = match[1]; // This is the entire <!-- Birthdays --> card

    // Remove the Right Sidebar completely and just close the page div properly
    c = c.replace(rightSidebarRegex, '</div>\n  `;');

    // Now find the Charts Row
    // <div class="fade-in delay-1" style="display:grid; grid-template-columns:1fr 1.2fr 1fr; gap:20px; margin-bottom:24px">
    
    const chartsRowRegex = /<div class="fade-in delay-1" style="display:grid; grid-template-columns:1fr 1\.2fr 1fr; gap:20px; margin-bottom:24px">/m;
    
    // Replace with 4 columns: 0.8fr 0.8fr 1fr 0.8fr or repeat(4, 1fr)
    // The user wanted "Employees by Position" and "Employees by Team" to be narrower.
    // Right now it's 1fr 1.2fr 1fr (Position, Team, Status)
    // Let's do: 1fr 1fr 1.2fr 1fr
    // Or simpler: repeat(4, 1fr)
    let newGrid = '<div class="fade-in delay-1" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:24px">';
    
    c = c.replace(chartsRowRegex, newGrid);
    
    // We need to insert the birthdayBlock right before the closing div of the Charts Row.
    // The Charts Row has 3 cards inside.
    // Let's find the end of the 3rd card in the charts row.
    // The 3rd card is the Employee Status.
    const statusCardRegex = /(<div class="card" style="padding:20px">\s*<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">\s*<div style="font-size:\.9rem; font-weight:700">ʶҹоѡҹ \(Employee Status\)<\/div>[\s\S]*?<\/div>\s*<\/div>)/m;
    
    const statusMatch = c.match(statusCardRegex);
    if (statusMatch) {
        // Insert birthday block after the status card
        c = c.replace(statusMatch[1], statusMatch[1] + '\n' + birthdayBlock);
    }

    fs.writeFileSync('js/pages.js', c);
    console.log("Success");
} else {
    console.log("Right sidebar not found");
}
