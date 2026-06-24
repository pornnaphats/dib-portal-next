$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

# The syntax error is:
#   </div>`;
#   }
# 
#   function toggleLeaveBulkMode() {

# We want to replace it with:
#   </div>`}
#   `;
#   }
# 
#   function toggleLeaveBulkMode() {

# Let's use Regex!
$pattern = '(?s)  </div>`;\r?\n  \}\r?\n\r?\n  function toggleLeaveBulkMode\(\) \{'
$replacement = "  </div>`}`r`n  `;`r`n  }`r`n`r`n  function toggleLeaveBulkMode() {"

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement)

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done with Regex!"
