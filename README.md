# 🎖️ GARRISON LEDGER

**AI-Powered Financial Planning for Military Life**

Garrison Ledger is an intelligent platform that helps military service members optimize their finances through AI-curated content and personalized planning.

---

## 🚀 QUICK START

### **For Developers**

1. **Read System Status**
   ```bash
   cat SYSTEM_STATUS.md
   ```
   This is your source of truth for the current state of the system.

2. **Review AI Agent Guidelines**
   ```bash
   cat .cursorrules
   ```
   Essential guidelines for working with this codebase.

3. **Check Development Workflow**
   ```bash
   cat docs/DEVELOPMENT_WORKFLOW.md
   ```
   Standard process for building features.

4. **Run Development Server**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 📚 DOCUMENTATION

### **Essential Reading**
- [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md) - Current system state & architecture
- [`.cursorrules`](./.cursorrules) - AI agent guidelines & coding standards
- [`CHANGELOG.md`](./CHANGELOG.md) - Version history & changes
- [`docs/`](./docs/) - Detailed documentation

### **Documentation Structure**
```
docs/
├── active/          # Current system documentation
├── archive/         # Historical documentation
├── guides/          # How-to guides
└── planning/        # Future plans
```

See [`docs/README.md`](./docs/README.md) for complete documentation index.

---

## 🏗️ ARCHITECTURE

### **Core Innovation: AI Master Curator**

Garrison Ledger uses a two-phase AI system to generate personalized financial plans:

1. **AI Master Curator** - GPT-4o analyzes user profile and selects 8-10 most relevant content blocks from 410+ expert-curated articles
2. **AI Narrative Weaver** - GPT-4o creates personalized introductions, transitions, and action items

**Cost:** ~$0.25 per plan | **Time:** ~30 seconds

### **Technology Stack**

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Storage)
- **Authentication:** Clerk
- **Payments:** Stripe
- **AI:** OpenAI GPT-4o
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL with RLS)

### **Key Systems**

1. **AI Plan Generation** - Personalized financial plans
2. **Content Intelligence** - 410 hand-curated content blocks
3. **Calculator Tools** - 6 military-specific financial calculators
4. **Binder** - Document management with expiration tracking
5. **Premium Subscription** - Stripe-powered monetization

---

## 🎯 FEATURES

### **For Users**
- ✅ AI-generated personalized financial plans
- ✅ 6 financial calculator tools (TSP, SDP, House Hacking, etc.)
- ✅ 410+ expert-curated content blocks
- ✅ AI-powered content discovery
- ✅ Document management (Binder)
- ✅ 5 resource hub pages
- ✅ Premium subscription tiers

### **For Developers**
- ✅ TypeScript throughout
- ✅ Server & Client Components
- ✅ Row Level Security (RLS)
- ✅ Automated deployments
- ✅ Comprehensive documentation
- ✅ AI agent guidelines

---

## 🔧 DEVELOPMENT

### **Prerequisites**
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Clerk account
- Stripe account (for payments)
- OpenAI API key

### **Environment Variables**
See [`docs/guides/ENV_SETUP.md`](./docs/guides/ENV_SETUP.md) for setup instructions.

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

### **Development Workflow**

1. **Create Feature Branch** (optional)
   ```bash
   git checkout -b feature/name
   ```

2. **Follow Development Workflow**
   See [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md)

3. **Test Thoroughly**
   - Manual testing
   - Check mobile responsive
   - Verify authentication
   - Test edge cases

4. **Deploy**
   ```bash
   npm run lint
   git add -A
   git commit -m "✨ Feature description"
   git push origin main
   ```

### **Database Migrations**

1. Create migration file in `supabase-migrations/`
2. Test locally if possible
3. Apply via Supabase dashboard
4. Update `SYSTEM_STATUS.md`

---

## 📊 PROJECT STATUS

**Version:** 2.0.0 (AI-Powered)  
**Status:** 🟢 Production Ready  
**Last Updated:** 2025-01-15

### **Recent Updates**
- ✅ AI Master Curator System (v2.0.0)
- ✅ Personalized Plan Generation
- ✅ Content Metadata Complete (100%)
- ✅ Navigation Enhanced
- ✅ Homepage AI Positioning

See [`CHANGELOG.md`](./CHANGELOG.md) for full version history.

---

## 🔒 SECURITY

- ✅ Row Level Security (RLS) on all user tables
- ✅ API endpoints check authentication
- ✅ Environment variables not committed
- ✅ Webhook signature verification
- ✅ Rate limiting on API routes

---

## 📈 PERFORMANCE

- **Page Load:** < 3 seconds
- **AI Plan Generation:** ~30 seconds
- **Database Queries:** Optimized with indexes
- **Content Blocks:** 410 with complete metadata
- **Content Rating:** 3.30/5.0 average

---

## 🎯 ROADMAP

### **Short-term**
- [ ] Plan regeneration feature
- [ ] Enhanced user ratings
- [ ] Behavioral learning from engagement

### **Long-term**
- [ ] Advanced AI features (what-if scenarios)
- [ ] Custom model training
- [ ] MyPay/TSP API integration
- [ ] Mobile app

See `SYSTEM_STATUS.md` for detailed priorities.

---

## 📞 RESOURCES

### **Services**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Stripe Dashboard](https://dashboard.stripe.com)

### **Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 🤝 CONTRIBUTING

1. Read `SYSTEM_STATUS.md`
2. Read `.cursorrules`
3. Read `docs/DEVELOPMENT_WORKFLOW.md`
4. Create feature branch
5. Follow coding standards
6. Test thoroughly
7. Update documentation
8. Submit PR

---

## 📝 LICENSE

Proprietary - All Rights Reserved

---

## 📧 CONTACT

For questions about this codebase, check:
1. `SYSTEM_STATUS.md` - Current state
2. `docs/` - Detailed documentation  
3. `.cursorrules` - Development guidelines

---

**Built with ❤️ for the military community**
