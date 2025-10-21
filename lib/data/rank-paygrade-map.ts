/**
 * RANK TO PAYGRADE MAPPING
 * 
 * Maps human-readable rank titles to standardized paygrade codes
 * Used by profile system to auto-derive paygrade from rank selection
 * 
 * Source: lib/data/military-ranks.json
 * Format: E01-E09, W01-W05, O01-O10
 */

/**
 * Get paygrade code from rank title
 * Uses pattern matching to handle rank variations across services
 * @param rankTitle Human-readable rank (e.g., "Sergeant (SGT)", "Private (Pvt)")
 * @returns Paygrade code (e.g., "E05", "E01") or null if not found
 */
export function getRankPaygrade(rankTitle: string): string | null {
  if (!rankTitle) return null;
  
  const upper = rankTitle.toUpperCase();
  
  // E-1 patterns
  if (upper.includes('PRIVATE') && (upper.includes('PV1') || upper.includes('PVT')) ||
      upper.includes('SEAMAN RECRUIT') ||
      upper.includes('AIRMAN BASIC') ||
      upper.includes('SPECIALIST 1')) {
    return 'E01';
  }
  
  // E-2 patterns
  if (upper.includes('PRIVATE') && upper.includes('PV2') ||
      upper.includes('SEAMAN APPRENTICE') ||
      upper.includes('AIRMAN') && !upper.includes('FIRST') && !upper.includes('SENIOR') ||
      upper.includes('SPECIALIST 2')) {
    return 'E02';
  }
  
  // E-3 patterns
  if (upper.includes('PRIVATE FIRST CLASS') || upper.includes('PFC') ||
      upper.includes('SEAMAN') && !upper.includes('RECRUIT') && !upper.includes('APPRENTICE') ||
      upper.includes('AIRMAN FIRST CLASS') || upper.includes('A1C') ||
      upper.includes('LANCE CORPORAL') || upper.includes('LCPL') ||
      upper.includes('SPECIALIST 3')) {
    return 'E03';
  }
  
  // E-4 patterns
  if (upper.includes('SPECIALIST') && (upper.includes('SPC') || upper.includes('SP4')) ||
      upper.includes('CORPORAL') && !upper.includes('LANCE') ||
      upper.includes('PETTY OFFICER THIRD') || upper.includes('PO3') ||
      upper.includes('SENIOR AIRMAN') || upper.includes('SRA') ||
      upper.includes('SPECIALIST 4')) {
    return 'E04';
  }
  
  // E-5 patterns
  if (upper.includes('SERGEANT') && !upper.includes('STAFF') && !upper.includes('FIRST') && !upper.includes('MASTER') && !upper.includes('GUNNERY') ||
      upper.includes('SGT') && upper.length < 30 ||
      upper.includes('PETTY OFFICER SECOND') || upper.includes('PO2')) {
    return 'E05';
  }
  
  // E-6 patterns
  if (upper.includes('STAFF SERGEANT') || upper.includes('SSG') ||
      upper.includes('TECHNICAL SERGEANT') || upper.includes('TSGT') ||
      upper.includes('PETTY OFFICER FIRST') || upper.includes('PO1')) {
    return 'E06';
  }
  
  // E-7 patterns
  if (upper.includes('SERGEANT FIRST CLASS') || upper.includes('SFC') ||
      upper.includes('GUNNERY SERGEANT') || upper.includes('GYSGT') ||
      upper.includes('CHIEF PETTY OFFICER') && !upper.includes('SENIOR') && !upper.includes('MASTER') ||
      upper.includes('MASTER SERGEANT') && !upper.includes('SENIOR') && !upper.includes('GUNNERY')) {
    return 'E07';
  }
  
  // E-8 patterns
  if (upper.includes('MASTER SERGEANT') ||  upper.includes('MSG') ||
      upper.includes('FIRST SERGEANT') || upper.includes('1SG') ||
      upper.includes('SENIOR CHIEF') || upper.includes('SCPO') ||
      upper.includes('SENIOR MASTER SERGEANT') || upper.includes('SMSGT')) {
    return 'E08';
  }
  
  // E-9 patterns
  if (upper.includes('SERGEANT MAJOR') || upper.includes('SGM') || upper.includes('CSM') ||
      upper.includes('MASTER CHIEF') || upper.includes('MCPO') ||
      upper.includes('CHIEF MASTER SERGEANT') || upper.includes('CMSGT') ||
      upper.includes('MASTER GUNNERY')) {
    return 'E09';
  }
  
  // W-1 through W-5
  if (upper.includes('WARRANT OFFICER 1') || upper.includes('WO1') || upper.includes('WO-1')) return 'W01';
  if (upper.includes('CHIEF WARRANT') && (upper.includes('2') || upper.includes('CW2') || upper.includes('CWO2'))) return 'W02';
  if (upper.includes('CHIEF WARRANT') && (upper.includes('3') || upper.includes('CW3') || upper.includes('CWO3'))) return 'W03';
  if (upper.includes('CHIEF WARRANT') && (upper.includes('4') || upper.includes('CW4') || upper.includes('CWO4'))) return 'W04';
  if (upper.includes('CHIEF WARRANT') && (upper.includes('5') || upper.includes('CW5') || upper.includes('CWO5'))) return 'W05';
  
  // O-1 patterns
  if (upper.includes('SECOND LIEUTENANT') || upper.includes('2LT') || upper.includes('2D LT') || upper.includes('2NDLT') ||
      upper.includes('ENSIGN') || upper.includes('ENS')) {
    return 'O01';
  }
  
  // O-2 patterns
  if (upper.includes('FIRST LIEUTENANT') || upper.includes('1LT') || upper.includes('1ST LT') || upper.includes('1STLT') ||
      upper.includes('LIEUTENANT JUNIOR') || upper.includes('LTJG')) {
    return 'O02';
  }
  
  // O-3 patterns
  if (upper.includes('CAPTAIN') && (upper.includes('CPT') || upper.includes('CAPT')) && !upper.includes('LIEUTENANT') ||
      upper.includes('LIEUTENANT') && upper.includes('LT)') && !upper.includes('JUNIOR') && !upper.includes('COLONEL') && !upper.includes('COMMANDER')) {
    return 'O03';
  }
  
  // O-4 patterns
  if (upper.includes('MAJOR') && !upper.includes('SERGEANT') && !upper.includes('GENERAL') ||
      upper.includes('LIEUTENANT COMMANDER') || upper.includes('LCDR')) {
    return 'O04';
  }
  
  // O-5 patterns
  if (upper.includes('LIEUTENANT COLONEL') || upper.includes('LTC') || upper.includes('LT COL') || upper.includes('LTCOL') ||
      upper.includes('COMMANDER') && upper.includes('CDR') && !upper.includes('LIEUTENANT')) {
    return 'O05';
  }
  
  // O-6 patterns
  if (upper.includes('COLONEL') && upper.includes('COL') && !upper.includes('LIEUTENANT') ||
      upper.includes('CAPTAIN') && upper.includes('CAPT') && upper.includes('NAVY')) {
    return 'O06';
  }
  
  // O-7 patterns
  if (upper.includes('BRIGADIER') || upper.includes('BRIG GEN') || upper.includes('BGEN') ||
      upper.includes('REAR ADMIRAL LOWER') || upper.includes('RDML')) {
    return 'O07';
  }
  
  // O-8 patterns
  if (upper.includes('MAJOR GENERAL') || upper.includes('MAJ GEN') || upper.includes('MAJGEN') ||
      upper.includes('REAR ADMIRAL') && !upper.includes('LOWER') && !upper.includes('VICE')) {
    return 'O08';
  }
  
  // O-9 patterns
  if (upper.includes('LIEUTENANT GENERAL') || upper.includes('LT GEN') || upper.includes('LTGEN') ||
      upper.includes('VICE ADMIRAL') || upper.includes('VADM')) {
    return 'O09';
  }
  
  // O-10 patterns
  if (upper.includes('GENERAL') && (upper.includes('GEN)') || upper.includes('(GEN')) ||
      upper.includes('ADMIRAL') && (upper.includes('ADM)') || upper.includes('(ADM')) && !upper.includes('REAR') && !upper.includes('VICE')) {
    return 'O10';
  }
  
  return null;
}

/**
 * Get rank category from paygrade code
 * @param paygrade Paygrade code (e.g., "E05", "O03", "W02")
 * @returns Category: "enlisted", "warrant", or "officer"
 */
export function getRankCategory(paygrade: string): 'enlisted' | 'warrant' | 'officer' | null {
  if (!paygrade) return null;
  
  const first = paygrade[0]?.toUpperCase();
  if (first === 'E') return 'enlisted';
  if (first === 'W') return 'warrant';
  if (first === 'O') return 'officer';
  
  return null;
}

/**
 * Check if paygrade is officer
 */
export function isOfficerPaygrade(paygrade: string): boolean {
  return paygrade?.startsWith('O') || paygrade?.startsWith('W');
}

/**
 * Check if paygrade is enlisted
 */
export function isEnlistedPaygrade(paygrade: string): boolean {
  return paygrade?.startsWith('E');
}
