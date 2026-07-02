import re

filepath = r"c:/antigravity-project/dib-portal-next/src/components/legacy-pages/legacyQcPlanLogic.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the invalid style rule 'background: var(--surface)fff;' with premium style
old_style_rule = ".qc-card {\n        background: var(--surface)fff;\n        border-radius: var(--radius, 14px);\n        padding: 16px;\n        box-shadow: var(--shadow);\n        border: 1px solid var(--border, #e4e8ef);\n      }"
new_style_rule = ".qc-card {\n        background: var(--surface) !important;\n        border-radius: 20px !important;\n        padding: 24px !important;\n        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03), 0 2px 10px rgba(0, 0, 0, 0.01) !important;\n        border: none !important;\n      }"

content = content.replace(old_style_rule, new_style_rule)
# Try CRLF version just in case
content = content.replace(old_style_rule.replace("\n", "\r\n"), new_style_rule.replace("\n", "\r\n"))

# 2. Replace the stat cards block
old_cards = """      <!-- TOP ROW: Stat Cards -->
      <div class="qc-top-row">
        <div class="qc-stat-card card-total">
          <div class="stat-card-title">เคสทั้งหมด</div>
          <div class="stat-card-value">
            <i data-lucide="layers" class="stat-icon"></i> ${(totalCases || 0).toLocaleString('en-US')} <span class="stat-card-unit">เคส</span>
          </div>
          <div class="stat-footer" style="flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3;">
            <div style="font-weight: 700; color: #0284c7;">QC: ${(totalQcCases || 0).toLocaleString('en-US')} เคส | Manual: ${(totalManualCases || 0).toLocaleString('en-US')} เคส</div>
            <div style="font-size: 0.68rem; opacity: 0.85;">Website: ${(websiteCases || 0).toLocaleString('en-US')} | Social: ${(socialCases || 0).toLocaleString('en-US')}</div>
          </div>
        </div>

        <div class="qc-stat-card card-qc1">
          <div class="stat-card-title">QC1</div>
          <div class="stat-card-value">
            <i data-lucide="file-text" class="stat-icon"></i> ${(qc1Cases || 0).toLocaleString('en-US')} <span class="stat-card-unit">เคส</span>
          </div>
          <div class="stat-footer" style="flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3;">
            <div style="font-weight: 600; opacity: 0.9;">${Math.round(totalCases > 0 ? qc1Cases / totalCases * 100 : 0)}% ของทั้งหมด</div>
            <div style="font-size: 0.65rem; opacity: 0.85; margin-top:2px;">Website: ${(qc1WebCases || 0).toLocaleString('en-US')} | Social: ${(qc1SocialCases || 0).toLocaleString('en-US')}</div>
          </div>
        </div>

        <div class="qc-stat-card card-qc2">
          <div class="stat-card-title">QC2</div>
          <div class="stat-card-value">
            <i data-lucide="shield-check" class="stat-icon"></i> ${(qc2Cases || 0).toLocaleString('en-US')} <span class="stat-card-unit">เคส</span>
          </div>
          <div class="stat-footer" style="flex-direction: column; align-items: flex-start; gap: 4px; line-height: 1.3;">
            <div style="font-weight: 600; opacity: 0.9;">${Math.round(totalCases > 0 ? qc2Cases / totalCases * 100 : 0)}% ของทั้งหมด</div>
            <div style="font-size: 0.65rem; opacity: 0.85; margin-top:2px;">Website: ${(qc2WebCases || 0).toLocaleString('en-US')} | Social: ${(qc2SocialCases || 0).toLocaleString('en-US')}</div>
          </div>
        </div>

        <div class="qc-stat-card card-manual">
          <div class="stat-card-title">Manual Cases</div>
          <div class="stat-card-value">
            <i data-lucide="hand" class="stat-icon"></i>
            ${(manualCases || 0).toLocaleString('en-US')} <span class="stat-card-unit">เคส</span>
          </div>
          <div class="stat-footer"><span>${Math.round(totalCases > 0 ? manualCases / totalCases * 100 : 0)}% ของทั้งหมด</span></div>
        </div>
      </div>"""

new_cards = """      <!-- TOP ROW: Stat Cards -->
      <div class="qc-top-row" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="stat-card fade-in" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="layers" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">เคสทั้งหมด</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              ${(totalCases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div style="font-size: .65rem; color: #0284c7; font-weight: 600; margin-top: 4px; line-height: 1.3;">
              QC: ${(totalQcCases || 0).toLocaleString('en-US')} | Manual: ${(totalManualCases || 0).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        <div class="stat-card fade-in delay-1" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="file-text" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">QC1</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              ${(qc1Cases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div style="font-size: .65rem; color: #3b82f6; font-weight: 600; margin-top: 4px; line-height: 1.3;">
              ${Math.round(totalCases > 0 ? qc1Cases / totalCases * 100 : 0)}% ของทั้งหมด
            </div>
          </div>
        </div>

        <div class="stat-card fade-in delay-2" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: #f0fdf4; color: #22c55e; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="shield-check" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">QC2</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              ${(qc2Cases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div style="font-size: .65rem; color: #22c55e; font-weight: 600; margin-top: 4px; line-height: 1.3;">
              ${Math.round(totalCases > 0 ? qc2Cases / totalCases * 100 : 0)}% ของทั้งหมด
            </div>
          </div>
        </div>

        <div class="stat-card fade-in delay-3" style="padding: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: #fffbeb; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
            <i data-lucide="hand" style="width: 20px; height: 20px"></i>
          </div>
          <div>
            <div style="font-size: .7rem; color: var(--text-3); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">Manual Cases</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text)">
              ${(manualCases || 0).toLocaleString('en-US')} <span style="font-size: .75rem; font-weight: 400; color: var(--text-3)">เคส</span>
            </div>
            <div style="font-size: .65rem; color: #d97706; font-weight: 600; margin-top: 4px; line-height: 1.3;">
              ${Math.round(totalCases > 0 ? manualCases / totalCases * 100 : 0)}% ของทั้งหมด
            </div>
          </div>
        </div>
      </div>"""

content = content.replace(old_cards, new_cards)
# Try CRLF version
content = content.replace(old_cards.replace("\n", "\r\n"), new_cards.replace("\n", "\r\n"))

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement complete successfully!")
