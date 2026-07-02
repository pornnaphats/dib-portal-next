const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;
const tailwindClasses = "text-[12px] font-semibold px-4 py-1.5";

walkDir('c:/antigravity-project/dib-portal-next/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We will use a regex to find all <button ...> ... </button>
    // We want to replace inline padding, font-size, height in the style attribute
    // And add the tailwindClasses to the class/className attribute

    // Regex to match <button ...>
    const buttonRegex = /<button([^>]*)>/g;
    
    content = content.replace(buttonRegex, (match, attrs) => {
      // Don't modify if it looks like an icon button (width/height 30px, etc.)
      if (attrs.includes('width:30px') || attrs.includes('width:28px') || attrs.includes('width:36px') || attrs.includes('border-radius:50%')) {
        return match;
      }
      
      // Remove inline padding, height, font-size, font-weight from style
      let newAttrs = attrs.replace(/padding\s*:\s*[^;"]+;?/g, '')
                          .replace(/font-size\s*:\s*[^;"]+;?/g, '')
                          .replace(/height\s*:\s*[^;"]+;?/g, '')
                          .replace(/font-weight\s*:\s*[^;"]+;?/g, '');

      // Add Tailwind classes
      // Check if it has className=" or class=" or class=' or className='
      if (newAttrs.includes('className="')) {
        newAttrs = newAttrs.replace('className="', `className="${tailwindClasses} `);
      } else if (newAttrs.includes("className='")) {
        newAttrs = newAttrs.replace("className='", `className='${tailwindClasses} `);
      } else if (newAttrs.includes('class="')) {
        newAttrs = newAttrs.replace('class="', `class="${tailwindClasses} `);
      } else if (newAttrs.includes("class='")) {
        newAttrs = newAttrs.replace("class='", `class='${tailwindClasses} `);
      } else {
        // Doesn't have class or className, add it
        // If we're inside a string literal, we use class=. If inside JSX, we use className=.
        // We'll just use class= if we don't see className=
        newAttrs += ` class="${tailwindClasses}"`;
      }
      
      // Clean up empty style attributes
      newAttrs = newAttrs.replace(/style="\s*"/g, '').replace(/style='\s*'/g, '');

      return `<button${newAttrs}>`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log(`Done. Modified ${modifiedCount} files.`);
