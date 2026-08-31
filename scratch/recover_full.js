const fs = require('fs');

const logFile = "C:\\Users\\pornnaphat_s\\.gemini\\antigravity\\brain\\f3efbd39-d5fc-4224-8bc5-14c7a7e36eac\\.system_generated\\logs\\transcript.jsonl";
const lines = fs.readFileSync(logFile, 'utf8').split('\n');

console.log("Searching for pageHolidaySummary code...");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    
    // Check in content or tool_calls
    if (data.content && data.content.includes('pageHolidaySummary') && data.content.includes('function')) {
      console.log(`Found in step ${data.step_index} content:`);
      // Print first 500 characters of the matched content
      console.log(data.content.substring(data.content.indexOf('pageHolidaySummary') - 200, data.content.indexOf('pageHolidaySummary') + 1000));
      console.log("-----------------------------------------");
    }
    
    if (data.tool_calls) {
      for (let tc of data.tool_calls) {
        const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
        if (args && args.ReplacementContent && args.ReplacementContent.includes('pageHolidaySummary')) {
          console.log(`Found in step ${data.step_index} tool_call ${tc.name} ReplacementContent:`);
          console.log(args.ReplacementContent.substring(0, 1000));
          console.log("-----------------------------------------");
        }
      }
    }
  } catch (e) {
    // ignore
  }
}
