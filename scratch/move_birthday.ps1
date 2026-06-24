$content = Get-Content js/pages.js -Raw -Encoding UTF8

# Find the Right Sidebar and capture it. Use (?s) for dot-all matching.
if ($content -match '(?s)<!-- Right Sidebar -->\s*<div style="display:flex; flex-direction:column; gap:20px">\s*(.*?)\s*</div>\s*</div>\s*`;') {
    $birthdayBlock = $matches[1]

    # Remove the Right Sidebar and close the layout properly
    $content = $content -replace '(?s)<!-- Right Sidebar -->\s*<div style="display:flex; flex-direction:column; gap:20px">\s*(.*?)\s*</div>\s*</div>\s*`;', "</div>`n  `;"

    # Update the Charts Grid
    $content = $content -replace '<div class="fade-in delay-1" style="display:grid; grid-template-columns:1fr 1\.2fr 1fr; gap:20px; margin-bottom:24px">', '<div class="fade-in delay-1" style="display:grid; grid-template-columns:1fr 1fr 1.2fr 1fr; gap:16px; margin-bottom:24px">'

    # Insert the Birthday Block after the Employee Status card
    # We will find the closing div of the Employee Status card and inject the birthdayBlock right after it.
    if ($content -match '(?s)(<div class="card" style="padding:20px">\s*<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">\s*<div style="font-size:\.9rem; font-weight:700">ʶҹоѡҹ \(Employee Status\)</div>.*?</div>\s*</div>)') {
        $statusCard = $matches[1]
        
        # We also want to reduce height of the Employee Status card container if needed, but let's just move it first.
        # Actually let's just make sure the height matches. The others are 240px. The birthday list is flexible.
        # It has <div style="display:flex; flex-direction:column; gap:16px">, let's add height:240px; overflow-y:auto; to it.
        $birthdayBlock = $birthdayBlock -replace '<div style="display:flex; flex-direction:column; gap:16px">', '<div style="display:flex; flex-direction:column; gap:16px; height:240px; overflow-y:auto; padding-right:5px">'

        $content = $content.Replace($statusCard, "$statusCard`n$birthdayBlock")
    }

    Set-Content js/pages.js $content -Encoding UTF8
    Write-Host "Success!"
} else {
    Write-Host "Could not find Right Sidebar"
}
