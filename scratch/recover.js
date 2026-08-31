const fs = require('fs');
const path = require('path');

const logFile = "C:\\Users\\pornnaphat_s\\.gemini\\antigravity\\brain\\f3efbd39-d5fc-4224-8bc5-14c7a7e36eac\\.system_generated\\logs\\transcript.jsonl";

const lines = fs.readFileSync(logFile, 'utf8').split('\n');

console.log("Analyzing log file...");

// Let's find all replacements or views on legacyHolidayLogic.js
let lastContent = null;
let viewRanges = [];

for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    
    // Check for replace_file_content tool calls or outputs
    if (data.tool_calls) {
      for (let tc of data.tool_calls) {
        if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content' || tc.name === 'write_to_file') {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          if (args && args.TargetFile && args.TargetFile.includes('legacyHolidayLogic.js')) {
            console.log(`Step ${data.step_index}: Tool call ${tc.name}`, JSON.stringify(args, null, 2));
          }
        }
      }
    }
    
    // Check for file content in system or model responses
    if (data.content && data.content.includes('legacyHolidayLogic.js')) {
      // Print first 200 chars
      console.log(`Step ${data.step_index}: Response content contains legacyHolidayLogic.js`);
    }
  } catch (e) {
    // ignore
  }
}
