/**
 * Generate a valid MongoDB ObjectId string
 * @returns 24-character hex string that looks like a valid ObjectId
 */
export const generateObjectId = (): string => {
  // Generate a 24-character hex string that looks like a valid ObjectId
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 14);
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  
  return (timestamp + random + counter).padEnd(24, '0');
};

/**
 * Check if a string is a valid ObjectId format
 * @param id - String to check
 * @returns true if valid ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
