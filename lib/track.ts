// Tracking disabled per user request
export async function track(_name: string, _props: Record<string, unknown> = {}) {
  // No-op: tracking disabled
  return;
}

