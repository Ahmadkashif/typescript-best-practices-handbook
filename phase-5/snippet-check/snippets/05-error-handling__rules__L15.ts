export async function loadProfile(fetchProfile: () => Promise<string>): Promise<string> {
  try {
    return await fetchProfile();
  } catch (error) {
    throw new Error('Failed to load profile', { cause: error });
  }
}
export {};
