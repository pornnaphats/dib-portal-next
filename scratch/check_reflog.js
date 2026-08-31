const { execSync } = require('child_process');

console.log("Analyzing git reflog commits for legacyHolidayLogic.js...");

// Get list of reflog entries
const reflog = execSync('git reflog', { encoding: 'utf8' }).split('\n');

for (let entry of reflog) {
  if (!entry.trim()) continue;
  const hash = entry.split(' ')[0];
  try {
    const fileContent = execSync(`git show ${hash}:src/components/legacy-pages/legacyHolidayLogic.js`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lineCount = fileContent.split('\n').length;
    console.log(`Commit ${hash} (from: ${entry.substring(0, 50)}): ${lineCount} lines`);
  } catch (e) {
    // path might not exist in commit
  }
}
