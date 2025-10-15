# 📚 DOCUMENTATION INDEX

This directory contains all project documentation organized by status and purpose.

---

## 📁 DIRECTORY STRUCTURE

```
docs/
├── active/          # Current, relevant documentation
├── archive/         # Historical documentation (completed features, old plans)
├── guides/          # Step-by-step how-to guides
├── planning/        # Future plans and proposals
└── README.md        # This file
```

---

## 🎯 START HERE

### **First Time Developer?**
1. Read `../SYSTEM_STATUS.md` - Current system state
2. Read `../.cursorrules` - AI agent guidelines
3. Read `DEVELOPMENT_WORKFLOW.md` - How to work on features
4. Read `active/` docs for specific systems

### **Working on a Feature?**
1. Check `DEVELOPMENT_WORKFLOW.md` for process
2. Read relevant docs in `active/`
3. Update `../SYSTEM_STATUS.md` when done
4. Update `../CHANGELOG.md` with changes

### **Need Help?**
1. Check `guides/` for how-to instructions
2. Check `active/` for system documentation
3. Check `../SYSTEM_STATUS.md` for current state

---

## 📂 ACTIVE DOCUMENTATION

### **Core Systems**
- `AI_MASTER_CURATOR_IMPLEMENTATION.md` - AI plan generation system
- `DEEP_DIVE_AUDIT_COMPLETE.md` - Latest comprehensive audit
- `SYSTEM_BRIEFING.md` - Original system architecture
- `AI_SYSTEM_ARCHITECTURE.md` - AI system design

### **Features**
- `BINDER_MVP_COMPLETE.md` - Document management system
- `INTELLIGENCE_LIBRARY_FEATURE.md` - Content discovery

---

## 📋 GUIDES

### **Setup & Configuration**
- `DOMAIN_SETUP.md` - Domain and DNS configuration
- `ENV_SETUP.md` - Environment variables setup

### **Development**
- `DEVELOPMENT_WORKFLOW.md` - Standard development process

---

## 📦 ARCHIVE

Contains completed project documentation:
- Feature implementation summaries
- Old planning documents
- Historical audits and reports
- Completed migration documents

**Note:** Archive docs are for reference only. Check active docs for current state.

---

## 🔄 DOCUMENTATION WORKFLOW

### **When Creating New Docs**

1. **Determine Type**
   - System documentation → `active/`
   - How-to guide → `guides/`
   - Future planning → `planning/`
   - Completed feature → `archive/`

2. **Use Consistent Format**
   ```markdown
   # Title
   
   ## Purpose
   Why this exists
   
   ## Content
   Main documentation
   
   ## Related
   - Link to related docs
   - Link to code files
   ```

3. **Update This Index**
   Add link to new doc in appropriate section

### **When Completing a Feature**

1. **Archive Old Planning Docs**
   ```bash
   mv docs/planning/FEATURE.md docs/archive/
   ```

2. **Create Summary Doc**
   ```bash
   touch docs/archive/FEATURE_COMPLETE.md
   ```

3. **Update Active Docs**
   Update `SYSTEM_STATUS.md` with new feature

### **When Updating Existing Docs**

1. **Small Changes**
   - Just edit the file
   - Update "Last Updated" date
   - Commit with clear message

2. **Major Refactor**
   - Archive old version if significantly different
   - Create new version in active/
   - Update links in other docs

---

## 📝 DOCUMENTATION STANDARDS

### **File Naming**
- Use SCREAMING_SNAKE_CASE.md
- Be descriptive: `AI_MASTER_CURATOR_IMPLEMENTATION.md` not `ai_stuff.md`
- Use prefixes for related docs: `BINDER_*.md`

### **Content Structure**
```markdown
# Title (one per document)

## Section (major topics)

### Subsection (details)

#### Sub-subsection (if needed)

- Bullet points for lists
- Use **bold** for emphasis
- Use `code` for technical terms
```

### **Code Examples**
````markdown
```typescript
// Always specify language
const example = "code";
```
````

### **Links**
```markdown
# Relative links for internal docs
See [SYSTEM_STATUS.md](../SYSTEM_STATUS.md)

# Absolute links for external resources
See [Next.js Docs](https://nextjs.org/docs)
```

---

## 🎯 KEEP DOCUMENTATION

### **Current**
- Update as features change
- Remove outdated information
- Archive old versions

### **Accurate**
- Test code examples
- Verify links work
- Update after changes

### **Useful**
- Write for future developers
- Include context and rationale
- Provide examples

### **Organized**
- Use consistent structure
- Group related docs
- Maintain this index

---

## 🔍 FINDING DOCUMENTATION

### **By Topic**

**AI & Intelligence**
- `active/AI_MASTER_CURATOR_IMPLEMENTATION.md`
- `active/AI_SYSTEM_ARCHITECTURE.md`
- `active/INTELLIGENCE_LIBRARY_FEATURE.md`

**Core Systems**
- `active/SYSTEM_BRIEFING.md`
- `active/DEEP_DIVE_AUDIT_COMPLETE.md`
- `../SYSTEM_STATUS.md`

**Features**
- `active/BINDER_MVP_COMPLETE.md`
- Check `active/` for latest

**Setup & Configuration**
- `guides/DOMAIN_SETUP.md`
- `guides/ENV_SETUP.md`

**Development Process**
- `DEVELOPMENT_WORKFLOW.md`
- `../.cursorrules`
- `../CHANGELOG.md`

---

## 📊 DOCUMENTATION HEALTH

### **Good Documentation Has:**
- ✅ Clear purpose statement
- ✅ Current information (no more than 3 months old)
- ✅ Code examples that work
- ✅ Links to related docs
- ✅ Contact/resource information

### **Poor Documentation:**
- ❌ Outdated information
- ❌ Broken links
- ❌ Missing context
- ❌ No examples
- ❌ Unclear purpose

---

## 🔄 MAINTENANCE

### **Monthly Review**
- [ ] Check for outdated information
- [ ] Verify links still work
- [ ] Archive completed docs
- [ ] Update this index

### **After Major Changes**
- [ ] Update affected docs
- [ ] Archive old versions if needed
- [ ] Update SYSTEM_STATUS.md
- [ ] Update CHANGELOG.md

---

**Last Updated:** 2025-01-15

**Maintainer:** Development Team

**Questions?** Check `DEVELOPMENT_WORKFLOW.md` or ask the user.

