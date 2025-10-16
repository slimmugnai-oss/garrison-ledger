# 🎨 ICON USAGE GUIDE - Preventing Build Failures

## 🚨 **CRITICAL: Icon Registry System**

**Problem:** Icon-related build failures are the #1 cause of deployment issues in Garrison Ledger.

**Solution:** This guide provides a foolproof system to prevent icon errors.

---

## 📋 **Quick Reference: Available Icons**

### ✅ **ALWAYS USE THESE ICONS (Verified in Registry)**

#### **Navigation & Interface**
- `BarChart`, `Monitor`, `Search`, `Menu`
- `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `ArrowRight`, `ArrowLeft`, `Copy`, `ExternalLink`

#### **Actions & Status**
- `Check`, `CircleCheck`, `CheckCircle`, `CheckCircle2`
- `Plus`, `Pencil`, `Edit`, `Trash2`, `RefreshCw`
- `Lock`, `X`, `XCircle`, `AlertCircle`, `AlertTriangle`
- `Upload`, `Download`, `Send`, `Share2`

#### **Files & Documents**
- `File`, `Folder`, `FolderOpen`, `Image`
- `ClipboardCheck`, `ClipboardList`, `BookOpen`

#### **Business & Finance**
- `Briefcase`, `Target`, `Star`, `DollarSign`, `Banknote`
- `Landmark`, `TrendingUp`, `TrendingDown`, `PiggyBank`
- `Calculator`, `CreditCard`

#### **Military & Service**
- `Shield` (✅ **USE THIS FOR NAVY/MILITARY CONTEXTS**)

#### **Time & Calendar**
- `Timer` (✅ **USE THIS INSTEAD OF "Clock"**)
- `Calendar`

#### **Tools & Information**
- `Wrench`, `Lightbulb`, `Settings`, `HelpCircle`
- `Info`, `Activity`, `Database`, `Key`

#### **Communication**
- `Mail`, `MessageSquare`, `Users`, `User`
- `Heart`, `Link`, `Quote`

#### **Layout & Structure**
- `LayoutDashboard`, `Library`, `MapPin`, `Home`, `House`
- `ShoppingCart`, `Truck`, `Globe`, `Rss`

#### **Theme & UI**
- `Moon`, `Sun`, `Crown`, `Sparkles`, `Zap`, `Gift`

---

## ❌ **NEVER USE THESE ICONS (Don't Exist)**

- ~~`Ship`~~ → Use `Shield` for Navy contexts
- ~~`Anchor`~~ → Use `Shield` for Navy contexts  
- ~~`FileText`~~ → Use `File`
- ~~`FileCheck`~~ → Use `CheckCircle`
- ~~`Clock`~~ → Use `Timer`

---

## 🔧 **How to Add New Icons Safely**

### Step 1: Check if Icon Exists
```bash
# Search lucide-react documentation
# Visit: https://lucide.dev/icons/
```

### Step 2: Add to Registry
```typescript
// 1. Import in icon-registry.ts
import { NewIcon } from 'lucide-react';

// 2. Add to iconRegistry object
export const iconRegistry = {
  // ... existing icons
  NewIcon, // Add here
} as const;
```

### Step 3: Use Type-Safe
```tsx
<Icon name="NewIcon" className="h-5 w-5" />
```

---

## 🚨 **Emergency Icon Replacements**

If you see a build error with an icon, use these safe replacements:

| Broken Icon | Safe Replacement | Context |
|-------------|------------------|---------|
| `Ship` | `Shield` | Navy/military |
| `Anchor` | `Shield` | Navy/maritime |
| `FileText` | `File` | Documents |
| `FileCheck` | `CheckCircle` | Approval/verification |
| `Clock` | `Timer` | Time-related |

---

## 📝 **Pre-Deployment Checklist**

Before pushing code:

1. ✅ **Search for non-existent icons:**
   ```bash
   grep -r "Ship\|Anchor\|FileText\|FileCheck\|Clock" app/
   ```

2. ✅ **Verify all icons in registry:**
   - Check `app/components/ui/icon-registry.ts`
   - Ensure all used icons are imported and exported

3. ✅ **Test build locally:**
   ```bash
   npm run build
   ```

---

## 🛠️ **Developer Workflow**

### When Adding Icons:
1. **Check this guide first** - Use existing icons when possible
2. **Verify icon exists** at https://lucide.dev/icons/
3. **Add to registry** if new icon needed
4. **Test build** before committing

### When Fixing Icon Errors:
1. **Identify the broken icon** from build error
2. **Find safe replacement** from this guide
3. **Replace in all files** using search/replace
4. **Test build** to verify fix

---

## 📊 **Icon Usage Statistics**

Most commonly used icons in Garrison Ledger:
- `Shield` - Military/Navy contexts (15+ uses)
- `File` - Document contexts (20+ uses)
- `CheckCircle` - Success/approval (10+ uses)
- `Timer` - Time-related (8+ uses)
- `Monitor` - Technology/software (5+ uses)

---

## 🎯 **Best Practices**

1. **Reuse existing icons** - Don't add new ones unless necessary
2. **Use semantic names** - `Shield` for military, `File` for documents
3. **Consistent sizing** - `h-5 w-5` for small, `h-10 w-10` for large
4. **Type safety** - Always use `IconName` type
5. **Test builds** - Verify before pushing

---

## 🚀 **Quick Fix Commands**

```bash
# Find all potential icon issues
grep -r "Ship\|Anchor\|FileText\|FileCheck\|Clock" app/

# Replace common problematic icons
find app/ -name "*.tsx" -exec sed -i 's/name="Ship"/name="Shield"/g' {} \;
find app/ -name "*.tsx" -exec sed -i 's/name="Anchor"/name="Shield"/g' {} \;
find app/ -name "*.tsx" -exec sed -i 's/name="FileText"/name="File"/g' {} \;
find app/ -name "*.tsx" -exec sed -i 's/name="FileCheck"/name="CheckCircle"/g' {} \;
find app/ -name "*.tsx" -exec sed -i 's/name="Clock"/name="Timer"/g' {} \;
```

---

**Remember: When in doubt, use `Shield` for military contexts and `File` for documents!** 🛡️📄
