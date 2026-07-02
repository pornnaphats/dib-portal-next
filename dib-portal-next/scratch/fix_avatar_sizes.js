const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;

    // 1. Replace size 50 circle in legacyEmployeeLogic.js and legacyLeaveLogic.js
    // Look for: font-size:16px; line-height:1.2; border:none; box-shadow:0 6px 12px -2px #6c5ce780; padding:0 4px; box-sizing:border-box; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    content = content.replace(
        /(avatarHtml\s*=\s*`\s*<div\s+style="[^"]*background-color:#6c5ce7;[^"]*font-size:16px;[^"]*">)(\${nick})(<\/div>`)/g,
        (match, prefix, nameExpr, suffix) => {
            // Replace the font-size:16px; with a dynamic font-size variable
            const updatedPrefix = prefix.replace('font-size:16px;', 'font-size:${nick.length > 5 ? \'10px\' : (nick.length > 3 ? \'12px\' : \'15px\')};');
            return updatedPrefix + nameExpr + suffix;
        }
    );

    // 2. Replace size 100 circle in legacyOrgLogic.js
    content = content.replace(
        /(avatarHtml\s*=\s*`\s*<div\s+style="[^"]*background:linear-gradient\(135deg,\s*#818cf8\s+0%,\s*#635BFF\s+100%\);[^"]*font-size:20px;[^"]*">)(\${nick})(<\/div>`)/g,
        (match, prefix, nameExpr, suffix) => {
            const updatedPrefix = prefix.replace('font-size:20px;', 'font-size:${nick.length > 5 ? \'14px\' : (nick.length > 3 ? \'16px\' : \'20px\')};');
            return updatedPrefix + nameExpr + suffix;
        }
    );

    // 3. Replace size 50 circle in legacyOrgLogic.js (line 1210)
    content = content.replace(
        /(avatarHtml\s*=\s*`\s*<div\s+style="[^"]*background:linear-gradient\(135deg,\s*#818cf8\s+0%,\s*#635BFF\s+100%\);[^"]*font-size:14px;[^"]*">)(\${nick})(<\/div>`)/g,
        (match, prefix, nameExpr, suffix) => {
            const updatedPrefix = prefix.replace('font-size:14px;', 'font-size:${nick.length > 5 ? \'9px\' : (nick.length > 3 ? \'11px\' : \'13px\')};');
            return updatedPrefix + nameExpr + suffix;
        }
    );

    if (content.length !== originalLength || content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully updated: ${filePath}`);
    } else {
        console.log(`No changes made to: ${filePath}`);
    }
}

fixFile('src/components/employee/legacyEmployeeLogic.js');
fixFile('src/components/leave-management/legacyLeaveLogic.js');
fixFile('src/components/structure/legacyOrgLogic.js');
