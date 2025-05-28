import { ethers } from 'ethers';

const AVATAR_CACHE_KEY = 'wallet_avatar_';

/**
 * Fetches the ENS avatar for an address, caches it, and returns the URL. Returns empty string if not found.
 * @param address Ethereum address
 * @returns Promise<string> (avatar URL or empty string)
 */
export async function getUserAvatar(address: string): Promise<string> {
  if (!address) return '';
  const cacheKey = AVATAR_CACHE_KEY + address.toLowerCase();
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/8b6e5e5e5e5e5e5e5e5e5e5e5e5e5e5e'); // Replace with your Infura ID or use ethers.getDefaultProvider()
    const ensName = await provider.lookupAddress(address);
    if (ensName) {
      const avatar = await provider.getAvatar(ensName);
      if (avatar) {
        localStorage.setItem(cacheKey, avatar);
        return avatar;
      }
    }
  } catch (e) {
    // ignore
  }
  // No ENS avatar found
  return '';
}

/**
 * Clears the cached avatar for an address (call on logout)
 */
export function clearUserAvatarCache(address: string) {
  if (!address) return;
  localStorage.removeItem(AVATAR_CACHE_KEY + address.toLowerCase());
} 