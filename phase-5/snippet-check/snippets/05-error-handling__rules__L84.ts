export async function bad(job: () => Promise<void>): Promise<void> {
  try { await job(); } catch { /* ignore */ }
}
export {};
