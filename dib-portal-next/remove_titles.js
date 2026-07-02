const fs = require('fs');
const path = require('path');
const dirs = ['employee', 'leave-management', 'legacy-pages', 'structure'];
const basePath = 'src/components';

dirs.forEach(d => {
    const p = path.join(basePath, d);
    if (!fs.existsSync(p)) return;
    const files = fs.readdirSync(p).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    
    files.forEach(f => {
        const filePath = path.join(p, f);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match things like: title="Something" or title='Something' or title=`Something`
        // We have to be careful not to match too greedily.
        const regex = / title=(?:(["'])(?:(?=(\\?))\2.)*?\1|`[^`]*`)/g;
        
        const matches = content.match(regex);
        if (matches && matches.length > 0) {
            content = content.replace(regex, '');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Removed ${matches.length} title attributes from ${f}`);
        }
    });
});
