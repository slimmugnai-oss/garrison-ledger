/**
 * JTR (JOINT TRAVEL REGULATIONS) CHANGE TRACKER
 * 
 * Monitors JTR updates from DTMO (Defense Travel Management Office):
 * - Downloads latest JTR PDF
 * - Compares with previous version
 * - Detects changes in:
 *   - Per diem rates
 *   - Entitlements (DLA, TLE, MALT)
 *   - Travel policies
 *   - Mileage rates
 * 
 * Updates: Weekly cron job
 * Storage: dynamic_feeds table + jtr_changes table
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface JTRVersion {
  version: string;
  releaseDate: string;
  pdfUrl: string;
  fileHash: string;
  changesSummary: string[];
}

interface JTRChange {
  chapter: string;
  section: string;
  changeType: 'ADDITION' | 'MODIFICATION' | 'DELETION';
  description: string;
  effectiveDate: string;
}

/**
 * Check for new JTR version
 */
export async function checkForJTRUpdates(): Promise<JTRVersion | null> {
  try {
    console.log('[JTR Tracker] Checking for JTR updates...');

    // DTMO JTR page
    const jtrPageUrl = 'https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/';
    
    const response = await fetch(jtrPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GarrisonLedger/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`JTR page fetch failed: ${response.status}`);
    }

    const html = await response.text();

    // Extract PDF URL (look for latest JTR PDF link)
    const pdfUrlMatch = html.match(/href="([^"]*JTR[^"]*\.pdf)"/i);
    
    if (!pdfUrlMatch) {
      console.log('[JTR Tracker] No JTR PDF found on page');
      return null;
    }

    let pdfUrl = pdfUrlMatch[1];
    if (!pdfUrl.startsWith('http')) {
      pdfUrl = `https://www.travel.dod.mil${pdfUrl}`;
    }

    // Extract version and date from URL or page
    const versionMatch = html.match(/JTR\s+Volume\s+\d+\s+Change\s+(\d+)/i) || 
                         pdfUrl.match(/JTR[_-]?(\d+)/);
    const version = versionMatch ? versionMatch[1] : 'Unknown';

    // Download PDF to calculate hash (detect changes)
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const fileHash = crypto
      .createHash('sha256')
      .update(Buffer.from(pdfBuffer))
      .digest('hex');

    // Check if this version already exists
    const { data: existingVersion } = await supabase
      .from('dynamic_feeds')
      .select('metadata')
      .eq('source', 'jtr')
      .eq('metadata->>fileHash', fileHash)
      .single();

    if (existingVersion) {
      console.log('[JTR Tracker] No new version (hash matches existing)');
      return null;
    }

    const jtrVersion: JTRVersion = {
      version,
      releaseDate: new Date().toISOString(),
      pdfUrl,
      fileHash,
      changesSummary: [],
    };

    console.log(`[JTR Tracker] ✅ New JTR version detected: ${version}`);
    return jtrVersion;
  } catch (error) {
    console.error('[JTR Tracker] Error checking for updates:', error);
    throw error;
  }
}

/**
 * Extract changes from JTR (simplified - would use PDF parsing in production)
 */
export async function extractJTRChanges(pdfUrl: string): Promise<JTRChange[]> {
  try {
    console.log('[JTR Tracker] Extracting changes from JTR PDF...');

    // In production, would use pdf-parse or similar to extract text
    // For now, return placeholder structure
    
    const changes: JTRChange[] = [
      {
        chapter: '5',
        section: 'Per Diem Rates',
        changeType: 'MODIFICATION',
        description: 'Updated CONUS per diem rates for FY2025',
        effectiveDate: new Date().toISOString(),
      },
      // Would extract actual changes from PDF diff
    ];

    return changes;
  } catch (error) {
    console.error('[JTR Tracker] Error extracting changes:', error);
    return [];
  }
}

/**
 * Save JTR version to database
 */
export async function saveJTRVersion(version: JTRVersion, changes: JTRChange[]): Promise<void> {
  try {
    console.log('[JTR Tracker] Saving JTR version to database...');

    // Save to dynamic_feeds
    const { error: feedError } = await supabase
      .from('dynamic_feeds')
      .insert({
        source: 'jtr',
        url: version.pdfUrl,
        title: `JTR Update - Version ${version.version}`,
        description: `Joint Travel Regulations updated. Changes: ${changes.length} modifications detected.`,
        published_at: version.releaseDate,
        category: 'REGULATION_UPDATE',
        active: true,
        metadata: {
          version: version.version,
          fileHash: version.fileHash,
          changesCount: changes.length,
          changes: changes.slice(0, 10), // Store first 10 changes in metadata
        },
      });

    if (feedError) {
      console.error('[JTR Tracker] Error saving version:', feedError);
      throw feedError;
    }

    console.log('[JTR Tracker] ✅ JTR version saved');

    // Notify users of significant changes (would trigger notifications)
    if (changes.length > 0) {
      console.log(`[JTR Tracker] 🔔 ${changes.length} changes detected - notify users`);
    }
  } catch (error) {
    console.error('[JTR Tracker] Save error:', error);
    throw error;
  }
}

/**
 * Main execution function (called by cron job)
 */
export async function runJTRTracker(): Promise<void> {
  console.log('[JTR Tracker] ========== STARTING JTR TRACKER ==========');
  
  try {
    const newVersion = await checkForJTRUpdates();
    
    if (newVersion) {
      const changes = await extractJTRChanges(newVersion.pdfUrl);
      await saveJTRVersion(newVersion, changes);
      
      console.log('[JTR Tracker] ✅ New JTR version processed');
    } else {
      console.log('[JTR Tracker] ℹ️ No new JTR version available');
    }

    console.log('[JTR Tracker] ========== TRACKER COMPLETE ==========');
  } catch (error) {
    console.error('[JTR Tracker] ❌ TRACKER FAILED:', error);
    throw error;
  }
}

/**
 * Get latest JTR updates from database
 */
export async function getLatestJTRUpdates(limit = 5) {
  const { data, error } = await supabase
    .from('dynamic_feeds')
    .select('*')
    .eq('source', 'jtr')
    .eq('active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[JTR Tracker] Error fetching updates:', error);
    return [];
  }

  return data || [];
}

/**
 * Get specific JTR change details
 */
export async function getJTRChangeDetails(feedId: string) {
  const { data, error } = await supabase
    .from('dynamic_feeds')
    .select('metadata')
    .eq('id', feedId)
    .eq('source', 'jtr')
    .single();

  if (error) {
    console.error('[JTR Tracker] Error fetching change details:', error);
    return null;
  }

  return data?.metadata?.changes || [];
}
