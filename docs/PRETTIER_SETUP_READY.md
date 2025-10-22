# 🎨 PRETTIER AUTO-FORMATTING (INSTALLED, NOT ACTIVE)

**Status:** ✅ Installed | ⏸️ Disabled | 🔧 Ready to Enable  
**Last Updated:** October 22, 2025  
**Decision:** Keep available, don't enforce automatically

---

## 🤖 FOR AI AGENTS: READ THIS FIRST

**WHAT THIS IS:**
- Prettier is **installed** but **NOT running automatically**
- All config files are in place, tools are ready
- Pre-commit hook is **disabled** (see `.husky/pre-commit`)
- Can be enabled in 30 seconds if needed

**WHEN TO USE:**
- ✅ User explicitly asks to "format the code" or "run Prettier"
- ✅ Team grows to 3+ developers (consistency matters more)
- ✅ Code gets messy and needs one-time cleanup
- ✅ External contributors submit PRs (need style enforcement)

**WHEN NOT TO USE:**
- ❌ Don't suggest formatting as a solution to bugs
- ❌ Don't run it automatically without asking
- ❌ Don't enable pre-commit hook without user approval
- ❌ Don't let it distract from feature work

**HOW TO ENABLE (if user requests):**
1. Uncomment `npx lint-staged` in `.husky/pre-commit`
2. Run `npm run format` to format entire codebase
3. Test build: `npm run build`
4. Commit changes

---

## 📦 What's Installed

### **NPM Packages (Already in package.json):**
```json
"prettier": "^X.X.X",
"prettier-plugin-tailwindcss": "^X.X.X",
"lint-staged": "^X.X.X"
```

### **Configuration Files:**
- ✅ `.prettierrc` - Prettier settings (100 char width, double quotes, Tailwind sorting)
- ✅ `.prettierignore` - Excludes docs, migrations, build artifacts
- ✅ `.editorconfig` - Editor consistency (spaces, LF, UTF-8)
- ✅ `.lintstagedrc.json` - Pre-commit formatting rules (disabled)
- ✅ `.vscode/settings.json` - Format-on-save settings

### **Scripts (Already in package.json):**
```json
"format": "prettier --write .",           // Format all files
"format:check": "prettier --check .",     // Check formatting (CI-friendly)
"lint:fix": "npm run lint -- --fix"       // ESLint auto-fix (separate)
```

---

## 🎯 Why It's Disabled

**Decision made:** October 22, 2025

**Reasoning:**
- Small team (1-2 developers) - consistency not critical yet
- Code is already reasonably clean
- Higher ROI activities: features, performance, marketing, revenue
- Tooling should serve users, not distract from shipping
- Can enable later if team grows or code gets messy

**What IS running:**
- ✅ ESLint (bug catching, accessibility checks) - **HIGH VALUE**
- ✅ TypeScript strict mode - **HIGH VALUE**
- ✅ Secret scanning - **HIGH VALUE**
- ✅ Icon validation - **HIGH VALUE**

**What is NOT running:**
- ⏸️ Prettier auto-format on commit
- ⏸️ Prettier format-on-save (optional in editor)

---

## 🚀 Manual Usage (Anytime)

### **Format Specific Files:**
```bash
# Format one file
npx prettier --write app/components/MyComponent.tsx

# Format a directory
npx prettier --write "app/components/**/*.tsx"

# Format everything
npm run format
```

### **Check Formatting (No Changes):**
```bash
# Check all files
npm run format:check

# Check specific files
npx prettier --check "app/**/*.tsx"
```

### **What Prettier Does:**
- ✅ Enforces consistent spacing, quotes, line breaks
- ✅ Sorts Tailwind classes automatically
- ✅ Adds/removes semicolons to match style
- ✅ Fixes trailing commas
- ❌ Does NOT reorder imports (ESLint does this, but it's risky)
- ❌ Does NOT change logic or functionality

---

## ⚡ How to Enable Auto-Formatting

### **Step 1: Enable Pre-Commit Hook**
Edit `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged  # ← Uncomment this line
```

### **Step 2: Format Entire Codebase (First Time)**
```bash
# Create test branch
git checkout -b enable-prettier

# Format everything
npm run format

# Test build
npm run build

# Test dev server
npm run dev

# If all good, commit
git add .
git commit -m "chore: enable Prettier auto-formatting"
git checkout main
git merge enable-prettier
```

### **Step 3: Done**
Now every `git commit` will auto-format staged files.

---

## 🔧 Configuration Details

### **Prettier Settings (.prettierrc):**
```json
{
  "printWidth": 100,          // Max line length
  "semi": true,               // Semicolons required
  "singleQuote": false,       // Double quotes
  "trailingComma": "es5",     // Trailing commas
  "plugins": ["prettier-plugin-tailwindcss"]  // Auto-sort Tailwind
}
```

### **What Gets Formatted (.lintstagedrc.json):**
```json
{
  "**/*.{js,jsx,ts,tsx,json,css}": ["prettier --write"]
}
```

### **What's Excluded (.prettierignore):**
- `node_modules/` - Dependencies
- `.next/`, `out/`, `build/` - Build artifacts
- `public/` - Static assets
- `*.md`, `*.mdx` - Markdown docs
- `*.sql` - Database migrations
- `supabase-migrations/` - Migration files
- `scripts/` - One-off scripts
- `resource toolkits/` - External resources
- `newsletter-workspace/` - Newsletter content

---

## 🎖️ Military Audience Context

**Remember:** Your users are military families who care about:
- ✅ Accurate BAH calculations
- ✅ Fast, responsive pages
- ✅ Mobile-friendly tools
- ✅ Secure data handling
- ✅ Trustworthy financial guidance

**They don't care about:**
- ❌ Single vs double quotes
- ❌ Trailing commas
- ❌ Line length
- ❌ Code style consistency

**Priority order:** Security > Features > UX > Performance > Code Quality > Formatting

---

## 📊 Decision Matrix for AI Agents

### **User says: "Format my code" / "Run Prettier"**
**DO:**
1. Create test branch
2. Run `npm run format`
3. Show git diff summary
4. Test build
5. Commit if all passes

### **User says: "Set up auto-formatting"**
**DO:**
1. Explain what it does (cosmetic only)
2. Explain risks (minimal, but test first)
3. Get explicit approval
4. Enable pre-commit hook
5. Format codebase
6. Test thoroughly

### **User says: "My code is messy"**
**DO:**
1. Suggest `npm run format` for one-time cleanup
2. DON'T auto-enable pre-commit hook
3. Let them decide if they want ongoing enforcement

### **User is debugging a bug**
**DON'T:**
- ❌ Suggest formatting as a solution
- ❌ Run Prettier while debugging
- ❌ Distract from the actual problem

### **User is shipping a feature**
**DON'T:**
- ❌ Suggest formatting before deployment
- ❌ Add formatting to the PR
- ❌ Block feature work for style issues

---

## 🚨 Important Notes for AI Agents

### **1. Prettier vs ESLint:**
- **Prettier** = Style only (spacing, quotes, commas) - **DISABLED**
- **ESLint** = Bugs, best practices, accessibility - **ENABLED, KEEP IT**

### **2. Risk Assessment:**
- **Low risk:** Prettier formatting (cosmetic only)
- **Medium risk:** ESLint auto-fix (can reorder imports)
- **High risk:** Disabling type checking or security scans

### **3. When User Asks "Should we enable Prettier?"**
**Be honest:**
- "For a small team, marginal benefit"
- "Won't improve UX or performance"
- "Nice-to-have, not essential"
- "Focus on features > formatting"
- "Can enable later if team grows"

### **4. Never:**
- ❌ Commit formatted code without user approval
- ❌ Enable pre-commit hook automatically
- ❌ Run `npm run format` during feature development
- ❌ Suggest formatting to fix functional issues

---

## 📁 Related Files

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to skip
- `.lintstagedrc.json` - Pre-commit rules
- `.husky/pre-commit` - Git hook (DISABLED)
- `.editorconfig` - Editor settings
- `.vscode/settings.json` - VSCode/Cursor settings
- `package.json` - Scripts and dependencies
- `eslint.config.mjs` - ESLint config (still active)

---

## 🔄 Maintenance

### **If Dependencies Update:**
```bash
npm update prettier prettier-plugin-tailwindcss
```

### **If Tailwind Classes Aren't Sorting:**
1. Check `.prettierrc` has `prettier-plugin-tailwindcss`
2. Check VSCode has Prettier extension
3. Try: `npx prettier --write <file>`

### **If Pre-Commit Hook Isn't Working:**
```bash
# Re-initialize Husky
npx husky install
chmod +x .husky/pre-commit
```

---

## ✅ Quick Reference

```bash
# Manual formatting (anytime, safe)
npm run format                      # Format all files
npx prettier --write <file>         # Format one file

# Check formatting (no changes)
npm run format:check                # Check all files

# Enable auto-formatting (requires approval)
# 1. Edit .husky/pre-commit - uncomment "npx lint-staged"
# 2. Run npm run format
# 3. Test build
# 4. Commit

# Disable auto-formatting
# Edit .husky/pre-commit - comment out "npx lint-staged"
```

---

**Summary:** Prettier is installed and ready. Use it manually when needed. Enable auto-formatting only if user requests or team grows. Focus on shipping features over code style.

