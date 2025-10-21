#!/bin/bash

# Only fix files with ESLint-confirmed unused 'error' variables

sed -i '' 's/} catch (error) {/} catch {/g' \
  app/components/BillingPortalButton.tsx \
  app/components/DownloadGuideButton.tsx \
  app/components/PaymentButton.tsx \
  app/components/dashboard/ActivityFeed.tsx \
  app/components/dashboard/IntelligenceWidget.tsx \
  app/components/home/ExitIntentPopup.tsx \
  app/components/mdx/DataRef.tsx \
  app/components/mdx/RateBadge.tsx \
  app/components/profile/MultiStepProfileWizard.tsx \
  app/components/tools/PcsFinancialPlanner.tsx \
  app/dashboard/admin/briefing/page.tsx \
  app/dashboard/admin/content-review/page.tsx \
  app/dashboard/admin/intel-analytics/page.tsx \
  app/dashboard/binder/page.tsx \
  app/dashboard/tdy-voucher/TdyVoucherClient.tsx \
  app/tools/[tool]/view/[shareId]/page.tsx \
  lib/content/audit.ts \
  lib/content/mdx-loader.ts \
  lib/dynamic/providers/bah.ts \
  lib/hooks/usePremiumStatus.ts \
  lib/navigator/amenities.ts \
  lib/navigator/demographics.ts \
  lib/navigator/distance.ts \
  lib/navigator/military.ts \
  lib/pcs/distance.ts \
  lib/premium.ts \
  lib/tdy/util.ts

echo "Fixed unused 'error' variables in $(echo "$@" | wc -l) files"

