$content = Get-Content js/pages.js -Raw -Encoding UTF8

$target = "  </div>`;`r`n  }"
$replacement = "  </div>`}`r`n  `;`r`n  }"

$content = $content.Replace($target, $replacement)

$target2 = "  </div>`;`n  }"
$replacement2 = "  </div>`}`n  `;`n  }"

$content = $content.Replace($target2, $replacement2)

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Replaced properly"
