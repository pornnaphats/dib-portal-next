$content = Get-Content js/pages.js -Raw -Encoding UTF8
$old = "      </div>`r`n    </div>`r`n    </div>`r`n    <div class=`"card`" style=`"padding:20px`">"
$new = "      </div>`r`n    </div>`r`n    <div class=`"card`" style=`"padding:20px`">"

# In case it's just \n instead of \r\n
$old2 = "      </div>`n    </div>`n    </div>`n    <div class=`"card`" style=`"padding:20px`">"
$new2 = "      </div>`n    </div>`n    <div class=`"card`" style=`"padding:20px`">"

$content = $content.Replace($old, $new).Replace($old2, $new2)

Set-Content js/pages.js $content -Encoding UTF8
Write-Host "Done!"
