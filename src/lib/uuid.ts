
/**
 * Generate a more reliable v4 UUID
 * This implementation follows RFC4122 more closely
 */
export const v4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // Use crypto API if available for better randomness
    let r;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const rands = new Uint8Array(1);
      window.crypto.getRandomValues(rands);
      r = rands[0] % 16;
    } else {
      r = Math.random() * 16 | 0;
    }
    
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
