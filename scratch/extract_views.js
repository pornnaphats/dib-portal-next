const fs = require('fs');

const logFile = "C:\\Users\\pornnaphat_s\\.gemini\\antigravity\\brain\\f3efbd39-d5fc-4224-8bc5-14c7a7e36eac\\.system_generated\\logs\\transcript.jsonl";
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

console.log("Analyzing file views in log...");

for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    
    // Check if type is VIEW_FILE and content contains legacyHolidayLogic.js
    if (data.type === 'VIEW_FILE' && data.content && data.content.includes('legacyHolidayLogic.js')) {
      // Find start line and end line in the view_file call
      console.log(`Step ${data.step_index}: VIEW_FILE output:`);
      // Print first 3 lines of output
      const outputLines = data.content.split('\n');
      console.log(outputLines.slice(0, 5).join('\n'));
      console.log(`Total lines in this content: ${outputLines.length}`);
      console.log("-----------------------------------------");
    }
  } catch (e) {
    // ignore
  }
}
