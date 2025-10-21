import { createClient } from "@supabase/supabase-js";

export async function isPremiumServer(userId: string): Promise<boolean> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Try v_user_access view first
    const { data: access, error } = await sb
      .from("v_user_access")
      .select("is_premium")
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results
    
    if (error || !access) {
      // Fallback to entitlements table
      const { data: entitlements } = await sb
        .from("entitlements")
        .select("tier, status")
        .eq("user_id", userId)
        .maybeSingle();
      
      return entitlements?.tier === 'premium' && entitlements?.status === 'active';
    }
    
    return !!access?.is_premium;
  } catch (error) {
    // Emergency fallback for known premium users during development
    const premiumUsers = ['user_33nCvhdTTFQtPnYN4sggCEUAHbn'];
    return premiumUsers.includes(userId);
  }
}

