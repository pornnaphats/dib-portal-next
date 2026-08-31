const { execSync } = require('child_process');

console.log("Searching all reflog commits for 'pageHolidaySummary'...");

const reflog = execSync('git reflog', { encoding: 'utf8' }).split('\n');
const checked = new Set();

for (let entry of reflog) {
  if (!entry.trim()) continue;
  const hash = entry.split(' ')[0];
  if (checked.has(hash)) continue;
  checked.add(hash);
  
  try {
    const fileContent = execSync(`git show ${hash}:src/components/legacy-pages/legacyHolidayLogic.js`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (fileContent.includes('pageHolidaySummary')) {
      console.log(`Found in commit: ${hash} (${entry.substring(0, 60)})`);
    }
  } catch (e) {
    // path might not exist
  }
}
