import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function checkAndIncrement(userId: string, route: string, limit: number) {
  const sb = createClient(url, key);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // upsert then increment atomically
  const { data, error } = await sb.rpc("api_quota_inc", { 
    p_user_id: userId, 
    p_route: route, 
    p_day: today 
  });
  
  if (error) {
    // Fallback: naive upsert
    await sb.from("api_quota").upsert({ user_id: userId, route, day: today, count: 1 });
    return { allowed: true, count: 1 };
  }
  
  const count = Array.isArray(data) && data[0]?.count ? data[0].count : 1;
  return { allowed: count <= limit, count };
}

