# Validation System

## Overview

Garrison Ledger uses a **layered validation approach** to ensure code quality and prevent deployment failures.

---

## Layer 1: Pre-Commit Hook (Automatic)

**Runs automatically** on every `git commit`.

**Checks:**
1. ✅ **TypeScript** - Ensures no type errors (`tsc --noEmit`)
2. ✅ **ESLint** - Enforces code style and catches common mistakes
3. ✅ **Secret Scan** - Prevents accidental commit of API keys/secrets
4. ✅ **Content Linting** - Validates MDX content files (if changed)

**What happens:**
```bash
$ git commit -m "Add feature"
🔍 Running pre-commit validation...
📘 Checking TypeScript...
🔧 Running ESLint...
🔒 Running secret scan...
✅ All pre-commit checks passed!
[main abc123] Add feature
```

**If validation fails:**
```bash
❌ TypeScript errors found! Fix them before committing.
```
The commit will be **blocked** until you fix the errors.

**Bypass (use sparingly):**
```bash
git commit --no-verify  # Skips pre-commit checks
```

---

## Layer 2: Manual Validation (Before Deploy)

**Run manually** before pushing to GitHub/deploying.

### Quick Validation
```bash
npm run validate
```

This runs:
- TypeScript check
- ESLint
- Secret scan

**Use this before:**
- Pushing to `main`
- Creating a pull request
- Major refactoring

### Full Pre-Deploy Check
```bash
npm run pre-deploy
```

This runs:
- Health check
- Icon validation
- Secret scan
- **Full build** (catches build-time errors)

**Use this before:**
- Production deployments
- Major releases
- Infrastructure changes

---

## Layer 3: CI/CD (Final Safety Net)

**Vercel** automatically runs on every push to `main`.

**Checks:**
- Full Next.js build
- TypeScript compilation
- ESLint
- Bundle optimization

**Result:**
- ✅ Success → Deployed to production
- ❌ Failure → Deployment blocked, rollback to previous version

---

## Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run type-check` | TypeScript only | Quick type validation |
| `npm run lint` | ESLint only | Fix code style issues |
| `npm run validate` | Type + Lint + Secrets | Before pushing to GitHub |
| `npm run pre-deploy` | Full build + checks | Before production deploy |
| `npm run secret-scan` | Secret detection | Verify no API keys committed |

---

## Common Issues

### Issue: TypeScript errors on commit
```bash
❌ TypeScript errors found! Fix them before committing.
```

**Solution:**
1. Run `npm run type-check` to see errors
2. Fix the type errors in your code
3. Try committing again

### Issue: ESLint errors on commit
```bash
❌ ESLint errors found! Fix them before committing.
```

**Solution:**
1. Run `npm run lint` to see errors
2. Many can be auto-fixed: `npm run lint -- --fix`
3. Fix remaining errors manually
4. Try committing again

### Issue: Need to commit urgently (bypass validation)
```bash
git commit --no-verify -m "Urgent fix"
```

**⚠️ Warning:** Only use `--no-verify` for:
- Emergency hotfixes
- Non-code commits (docs, config)
- When you're **certain** the code is safe

---

## Why This System?

### Before (Manual Checks):
- ❌ Easy to forget to run checks
- ❌ Syntax errors reached Vercel
- ❌ Deployment failures wasted time
- ❌ "Works on my machine" issues

### After (Automated Checks):
- ✅ **Automatic** - Can't forget to run
- ✅ **Fast feedback** - Errors caught in seconds
- ✅ **Confidence** - Know code will build before pushing
- ✅ **Team-friendly** - Works for all developers

---

## Performance

**Pre-commit hook:** ~5-10 seconds
- TypeScript: 3-5s
- ESLint: 2-3s
- Secret scan: 1-2s

**Worth it!** Saves 5+ minutes of waiting for failed Vercel builds.

---

## Customization

### Skip specific checks
Edit `.husky/pre-commit` to comment out checks you don't need:

```bash
# Skip TypeScript check (not recommended)
# npm run type-check
```

### Add custom checks
Add to `.husky/pre-commit`:

```bash
# Custom check
echo "🎨 Checking for console.log..."
npm run audit:console-logs
```

---

## Troubleshooting

### Pre-commit hook not running
```bash
# Reinstall husky
npm run prepare
```

### Hook runs but doesn't fail
Check exit codes in `.husky/pre-commit` - each check should `exit 1` on failure.

### Bypass for emergency
```bash
# Bypass pre-commit
git commit --no-verify

# Bypass pre-push (if configured)
git push --no-verify
```

---

## Best Practices

1. **Run `npm run validate`** before every push
2. **Never bypass checks** unless absolutely necessary
3. **Fix errors immediately** - don't let them accumulate
4. **Keep validation fast** - remove slow checks
5. **Trust the system** - it's there to help you

---

## Related Documentation

- [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) - Current system state
- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Setup guide
- [comprehensive-code-quality-audit.plan.md](../comprehensive-code-quality-audit.plan.md) - Full audit

---

**Created:** 2025-10-21  
**Last Updated:** 2025-10-21  
**Maintained By:** Development Team

