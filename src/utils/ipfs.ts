export const fetchFromIPFS = async (cid: string): Promise<string> => {
  const gateways = [
    import.meta.env.VITE_IPFS_GATEWAY,
    import.meta.env.VITE_IPFS_BACKUP_GATEWAY
  ];
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}/${cid}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!response.ok) throw new Error('IPFS fetch failed');
      return await response.text();
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error);
      continue;
    }
  }
  throw new Error('All IPFS gateways failed');
};

export const decodeIPFSData = (data: string): any => {
  try {
    const base64 = data;
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode IPFS data:', error);
    throw new Error('Invalid IPFS data format');
  }
}; 