// Tracking disabled per user request
export async function track(name: string, props: Record<string, unknown> = {}) {
  // No-op: tracking disabled
  return;
}

