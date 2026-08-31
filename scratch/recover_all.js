const fs = require('fs');
const path = require('path');

const brainDir = "C:\\Users\\pornnaphat_s\\.gemini\\antigravity\\brain";
const subdirs = fs.readdirSync(brainDir);

console.log("Scanning all conversations for pageHolidaySummary...");

for (let subdir of subdirs) {
  const fullSubdir = path.join(brainDir, subdir);
  if (!fs.statSync(fullSubdir).isDirectory()) continue;
  
  const logFile = path.join(fullSubdir, ".system_generated", "logs", "transcript.jsonl");
  if (!fs.existsSync(logFile)) continue;
  
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  for (let line of lines) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      // Check if it's a tool call to write_to_file or replace_file_content that contains pageHolidaySummary
      if (data.tool_calls) {
        for (let tc of data.tool_calls) {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          if (args && args.TargetFile && args.TargetFile.includes('legacyHolidayLogic.js') && 
              (args.CodeContent && args.CodeContent.includes('pageHolidaySummary') || 
               args.ReplacementContent && args.ReplacementContent.includes('pageHolidaySummary'))) {
            const content = args.CodeContent || args.ReplacementContent;
            console.log(`FOUND in conversation ${subdir}, step ${data.step_index}, tool ${tc.name}:`);
            console.log(`Content length: ${content.length}`);
            fs.writeFileSync(path.join(__dirname, `recovered_${subdir}_step_${data.step_index}.js`), content);
            console.log(`Saved to recovered_${subdir}_step_${data.step_index}.js`);
          }
        }
      }
    } catch (e) {}
  }
}

console.log("Scan complete.");
