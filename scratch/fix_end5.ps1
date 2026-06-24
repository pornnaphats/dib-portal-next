$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$target = @'
  </div>`;
  }

  function toggleLeaveBulkMode() {
'@

$replacement = @'
  </div>`}
  `;
  }

  function toggleLeaveBulkMode() {
'@

$content = $content.Replace($target, $replacement)

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done with proper single quotes."
