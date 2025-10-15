# 🎯 START HERE - Your Personal Quick Reference

**⭐ BOOKMARK THIS FILE ⭐**

This is your personal checklist and quick reference. Read this at the start of every session.

---

## 🚀 **EVERY SESSION RITUAL (30 seconds)**

```bash
# Run these 3 commands before starting work:
cat SYSTEM_STATUS.md | head -50    # What's the current state?
git status                          # What's changed locally?
git log --oneline -5               # What changed recently?
```

**Why:** These 30 seconds prevent hours of confusion and duplicated work.

---

## ✅ **YOUR RESPONSIBILITIES**

### **Things YOU Must Do:**

1. **📖 Read SYSTEM_STATUS.md First**
   - Before any work session
   - Before asking AI agents to do complex tasks
   - After being away for a few days

2. **✍️ Update Docs After Changes**
   - Changed a system? → Update `SYSTEM_STATUS.md`
   - Deployed a feature? → Update `CHANGELOG.md`
   - Built something significant? → Create doc in `docs/active/`

3. **🔍 Weekly Health Check (Friday, 15 min)**
   - Review `CHANGELOG.md` - what changed this week?
   - Check root directory - should only have 4 .md files
   - Quick scan of `SYSTEM_STATUS.md` - still accurate?

4. **💬 Give AI Agents Context**
   - Instead of: "Fix the assessment bug"
   - Say: "There's a bug in the assessment. We have two systems (old `assessments` table and new `user_assessments` with AI). Let's check the new AI system first."

5. **📋 Use TODO Lists for Complex Tasks**
   - 3+ step tasks → Create TODO list
   - Helps AI agents understand what you're doing
   - Prevents forgetting steps

---

## 🤖 **THINGS AI AGENTS HANDLE AUTOMATICALLY**

### **AI Will Do These For You:**

✅ **Follow `.cursorrules`** - Coding standards, security, best practices  
✅ **Create TODO lists** - When you say "let's build X" (complex tasks)  
✅ **Read `SYSTEM_STATUS.md`** - When you reference it or they need context  
✅ **Follow `DEVELOPMENT_WORKFLOW.md`** - Standard process for features  
✅ **Update documentation** - If you remind them at the end  
✅ **Test thoroughly** - Following the workflow checklist  
✅ **Commit with good messages** - Descriptive conventional commits  

### **AI Needs Your Help With:**

⚠️ **Knowing WHAT to build** - You define the feature/goal  
⚠️ **Business logic decisions** - "Should we do X or Y?"  
⚠️ **Remembering to update docs** - Say "and update SYSTEM_STATUS.md"  
⚠️ **Deployment decisions** - "Should we deploy this now?"  

---

## 🎯 **MAGIC PHRASES FOR AI AGENTS**

Use these to trigger the intelligent system:

| Say This | AI Does This |
|----------|--------------|
| "Check SYSTEM_STATUS.md first" | Reads current state before starting |
| "Follow .cursorrules" | Applies coding standards |
| "Use DEVELOPMENT_WORKFLOW.md" | Follows standard process |
| "Update docs when done" | Updates SYSTEM_STATUS & CHANGELOG |
| "Create TODO list" | Breaks complex tasks into steps |
| "Deep dive [system]" | Comprehensive audit of that system |

---

## 📚 **QUICK REFERENCE**

### **Most Important Files**
```
SYSTEM_STATUS.md       ⭐ Current state (read first!)
CHANGELOG.md           ⭐ Version history (update after deploy)
.cursorrules           ⭐ AI guidelines (AI reads automatically)
START_HERE.md          ⭐ This file (your personal guide)
```

### **When You Need To...**

**Build a new feature:**
1. Read `SYSTEM_STATUS.md` to understand current architecture
2. Tell AI: "Let's build X feature. Check SYSTEM_STATUS.md first."
3. AI will create TODO list and follow DEVELOPMENT_WORKFLOW.md
4. After done, remind AI: "Update SYSTEM_STATUS.md and CHANGELOG.md"

**Fix a bug:**
1. Tell AI what's broken and where you saw it
2. Mention relevant systems from SYSTEM_STATUS.md
3. AI will debug following the workflow
4. Update docs if architecture changed

**Understand a system:**
1. Check `SYSTEM_STATUS.md` first
2. Check `docs/active/` for detailed docs
3. Ask AI: "Explain how [system] works according to SYSTEM_STATUS.md"

**Deploy changes:**
1. AI will run linter
2. AI will commit with good message
3. AI will push to trigger Vercel deployment
4. **YOU verify** in production (AI can't do this)

---

## 🎓 **YOUR WORKFLOW**

### **Start of Session**
```
1. Run: cat SYSTEM_STATUS.md | head -50
2. Run: git status
3. Run: git log --oneline -5
4. Think: What am I working on today?
5. Tell AI with context about relevant systems
```

### **During Work**
```
1. AI follows .cursorrules automatically
2. AI creates TODO lists for complex tasks
3. AI implements following DEVELOPMENT_WORKFLOW.md
4. YOU review AI's work before committing
5. YOU make business decisions
```

### **End of Session**
```
1. Remind AI: "Update SYSTEM_STATUS.md and CHANGELOG.md"
2. AI updates docs
3. AI commits and pushes
4. YOU verify in production
5. YOU check Vercel deployment succeeded
```

### **Friday (15 min)**
```
1. Review CHANGELOG.md - what happened this week?
2. Check root directory - should be clean (4 files)
3. Scan SYSTEM_STATUS.md - still accurate?
4. Archive any completed docs if needed
```

---

## ⚡ **QUICK COMMANDS**

### **Daily**
```bash
# Start of session
cat SYSTEM_STATUS.md | head -50

# Check what changed
git log --oneline -5

# See current status
git status
```

### **After Changes**
```bash
# Lint before commit (AI does this automatically)
npm run lint

# Check what you're committing
git diff

# After AI commits and pushes, verify:
# 1. Check Vercel dashboard
# 2. Test in production
```

### **Friday Health Check**
```bash
# What changed this week?
cat CHANGELOG.md | head -50

# Are docs organized?
ls -1 *.md        # Should only show 4 files
ls -1 docs/active/

# Quick verify
cat SYSTEM_STATUS.md | grep "Last Updated"
```

---

## 🚨 **WARNING SIGNS**

If you see these, the system needs attention:

❌ **Root directory has 6+ .md files** → Move to docs/  
❌ **SYSTEM_STATUS.md "Last Updated" is old** → Needs update  
❌ **You're confused about system state** → Read SYSTEM_STATUS.md  
❌ **AI agents seem confused** → SYSTEM_STATUS.md probably outdated  
❌ **"I'll document it later"** → No! Update docs now  

---

## 💡 **TIPS FOR WORKING WITH AI AGENTS**

### **Good Prompts:**
✅ "Let's build a user rating system. Check SYSTEM_STATUS.md to see how our content system works, then create a TODO list."

✅ "There's a bug where plans aren't saving. According to SYSTEM_STATUS.md, we use the `user_plans` table with the new AI system. Let's investigate."

✅ "I want to refactor the assessment flow. First read the assessment section in SYSTEM_STATUS.md, then follow DEVELOPMENT_WORKFLOW.md."

### **Poor Prompts:**
❌ "Fix the bug" (No context about what or where)

❌ "Build a feature" (No context about systems affected)

❌ "Make it better" (Too vague, no actionable direction)

---

## 🎯 **REMEMBER**

### **You Are Responsible For:**
1. 📖 Reading SYSTEM_STATUS.md at session start
2. ✍️ Reminding AI to update docs after changes
3. 🔍 Friday health checks (15 minutes)
4. 💬 Giving AI context about systems
5. ✅ Verifying deployments in production

### **AI Agents Automatically:**
1. 🤖 Follow `.cursorrules` coding standards
2. 🤖 Create TODO lists for complex tasks
3. 🤖 Follow DEVELOPMENT_WORKFLOW.md process
4. 🤖 Write good commit messages
5. 🤖 Update docs (when you remind them)

### **The Key:**
> **Consistency beats perfection.** 
> 
> Spending 30 seconds at session start + 5 minutes updating docs saves hours of confusion later.

---

## 📞 **WHEN IN DOUBT**

1. **Read SYSTEM_STATUS.md** - What's the current state?
2. **Check .cursorrules** - What are the standards?
3. **Read docs/DEVELOPMENT_WORKFLOW.md** - What's the process?
4. **Ask AI with context** - Reference relevant systems

---

## 🎉 **YOU'VE GOT THIS!**

The system is designed to help you, not burden you. 

**Do these 3 things consistently:**
1. 📖 Read SYSTEM_STATUS.md before starting work (30 sec)
2. ✍️ Update docs after deploying features (5 min)
3. 🔍 Friday health check (15 min)

Everything else, AI agents will handle automatically.

---

**Last Updated:** 2025-01-15

**Questions?** Check SYSTEM_STATUS.md or ask an AI agent with context.

