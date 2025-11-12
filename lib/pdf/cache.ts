// PDF Cache System - Filesystem-based with 24h TTL
import fs from 'fs';
import path from 'path';
import os from 'os';

// Use /tmp in production (Vercel), .cache in development
const CACHE_DIR = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'pdf-cache')
  : path.join(process.cwd(), '.cache', 'pdfs');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  pdf: Buffer;
  charts: Record<string, string>; // Flexible chart storage (currently empty)
  createdAt: number;
}

interface CacheMetadata {
  auditId: string;
  updatedAt: number;
  createdAt: number;
  size: number;
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Generate cache key from audit ID and updated timestamp
 */
function getCacheKey(auditId: string | number, updatedAt: Date): string {
  return `audit-${auditId}-${updatedAt.getTime()}`;
}

/**
 * Get cache file path
 */
function getCacheFilePath(cacheKey: string): string {
  return path.join(CACHE_DIR, `${cacheKey}.json`);
}

/**
 * Check if cache entry is still valid (within TTL)
 */
function isCacheValid(createdAt: number): boolean {
  const age = Date.now() - createdAt;
  return age < CACHE_TTL_MS;
}

/**
 * Get cached PDF if exists and valid
 * Returns null if cache miss or expired
 */
export function getCachedPDF(
  auditId: string | number,
  updatedAt: Date
): CacheEntry | null {
  try {
    ensureCacheDir();
    
    const cacheKey = getCacheKey(auditId, updatedAt);
    const filePath = getCacheFilePath(cacheKey);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`[Cache] MISS - File not found: ${cacheKey}`);
      return null;
    }
    
    // Read cache file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const cacheEntry: CacheEntry = JSON.parse(fileContent);
    
    // Check if still valid
    if (!isCacheValid(cacheEntry.createdAt)) {
      console.log(`[Cache] EXPIRED - Removing: ${cacheKey}`);
      fs.unlinkSync(filePath);
      return null;
    }
    
    // Convert base64 back to Buffer
    const entry: CacheEntry = {
      pdf: Buffer.from(cacheEntry.pdf as any, 'base64'),
      charts: cacheEntry.charts,
      createdAt: cacheEntry.createdAt,
    };
    
    console.log(`[Cache] HIT - ${cacheKey} (age: ${Math.round((Date.now() - cacheEntry.createdAt) / 1000 / 60)}min)`);
    return entry;
  } catch (error) {
    console.error('[Cache] Error reading cache:', error);
    return null;
  }
}

/**
 * Store PDF in cache
 */
export function setCachedPDF(
  auditId: string | number,
  updatedAt: Date,
  pdf: Buffer,
  charts: Record<string, string> = {}
): void {
  try {
    ensureCacheDir();
    
    const cacheKey = getCacheKey(auditId, updatedAt);
    const filePath = getCacheFilePath(cacheKey);
    
    const cacheEntry: any = {
      pdf: pdf.toString('base64'),
      charts,
      createdAt: Date.now(),
    };
    
    fs.writeFileSync(filePath, JSON.stringify(cacheEntry));
    
    const sizeKB = Math.round(pdf.length / 1024);
    console.log(`[Cache] STORED - ${cacheKey} (${sizeKB} KB)`);
  } catch (error) {
    console.error('[Cache] Error writing cache:', error);
  }
}

/**
 * Invalidate all cache entries for a specific audit
 * Used when audit is updated
 */
export function invalidateAuditCache(auditId: string | number): void {
  try {
    ensureCacheDir();
    
    const prefix = `audit-${auditId}-`;
    const files = fs.readdirSync(CACHE_DIR);
    
    let deletedCount = 0;
    files.forEach(file => {
      if (file.startsWith(prefix)) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`[Cache] INVALIDATED - ${deletedCount} file(s) for audit ${auditId}`);
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}

/**
 * Clean up expired cache entries
 * Should be called periodically (e.g., daily cron job)
 */
export function cleanupExpiredCache(): number {
  try {
    ensureCacheDir();
    
    const files = fs.readdirSync(CACHE_DIR);
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const cacheEntry: CacheEntry = JSON.parse(fileContent);
        
        if (!isCacheValid(cacheEntry.createdAt)) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (error) {
        // If file is corrupted, delete it
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`[Cache] CLEANUP - Removed ${deletedCount} expired file(s)`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('[Cache] Error during cleanup:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalFiles: number;
  totalSize: number;
  validFiles: number;
  expiredFiles: number;
  oldestEntry?: Date;
  newestEntry?: Date;
} {
  try {
    ensureCacheDir();
    
    const files = fs.readdirSync(CACHE_DIR);
    let totalSize = 0;
    let validFiles = 0;
    let expiredFiles = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const cacheEntry: CacheEntry = JSON.parse(fileContent);
        
        if (isCacheValid(cacheEntry.createdAt)) {
          validFiles++;
        } else {
          expiredFiles++;
        }
        
        if (cacheEntry.createdAt < oldestTimestamp) {
          oldestTimestamp = cacheEntry.createdAt;
        }
        if (cacheEntry.createdAt > newestTimestamp) {
          newestTimestamp = cacheEntry.createdAt;
        }
      } catch (error) {
        expiredFiles++;
      }
    });
    
    return {
      totalFiles: files.length,
      totalSize,
      validFiles,
      expiredFiles,
      oldestEntry: oldestTimestamp < Infinity ? new Date(oldestTimestamp) : undefined,
      newestEntry: newestTimestamp > 0 ? new Date(newestTimestamp) : undefined,
    };
  } catch (error) {
    console.error('[Cache] Error getting stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      validFiles: 0,
      expiredFiles: 0,
    };
  }
}

/**
 * Clear all cache (for testing/maintenance)
 */
export function clearAllCache(): number {
  try {
    ensureCacheDir();
    
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    });
    
    console.log(`[Cache] CLEARED - Removed ${files.length} file(s)`);
    return files.length;
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
    return 0;
  }
}

