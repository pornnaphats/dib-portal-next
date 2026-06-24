$content = Get-Content js/pages.js -Raw -Encoding UTF8
$target = "    </div>`r`n  </div>\`;`r`n  }"
$replacement = "    </div>`r`n  </div>\`}`r`n  \`;`r`n  }"

$target2 = "    </div>`n  </div>\`;`n  }"
$replacement2 = "    </div>`n  </div>\`}`n  \`;`n  }"

$content = $content.Replace($target, $replacement).Replace($target2, $replacement2)
Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Replaced."
