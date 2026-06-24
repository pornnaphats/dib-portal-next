import sys
with open(" js/pages.js\, \r\, encoding=\utf-8\) as f:
 content = f.read()
content = content.replace(\<div style=\\\font-weight:700; color:var(--text); font-size:.85rem; line-height:1.2\\\></div>\, \<div style=\\\font-weight:700; color:var(--text); font-size:.85rem; line-height:1.2; white-space:nowrap\\\></div>\)
content = content.replace(\<td style=\\\font-size:.75rem; color:var(--text-3)\\\></td>\, \<td style=\\\font-size:.75rem; color:var(--text-3); white-space:nowrap\\\></td>\)
content = content.replace(\<td style=\\\font-size:.75rem; color:var(--text-3)\\\></td>\, \<td style=\\\font-size:.75rem; color:var(--text-3); white-space:nowrap\\\></td>\)
with open(\js/pages.js\, \w\, encoding=\utf-8\) as f:
 f.write(content)
