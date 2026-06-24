$content = [System.IO.File]::ReadAllText("c:\antigravity-project\js\pages.js")

$target = "  </div>`;`r`n  }"
$replacement = "  </div>`}`r`n  `;`r`n  }"

$content = $content.Replace($target, $replacement)

$target2 = "  </div>`;`n  }"
$replacement2 = "  </div>`}`n  `;`n  }"

$content = $content.Replace($target2, $replacement2)

[System.IO.File]::WriteAllText("c:\antigravity-project\js\pages.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"
