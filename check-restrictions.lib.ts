// Library version without shebang - safe for Vite to import
import { readFileSync } from 'fs';
import { minify } from '@swc/core';

const MAX_SIZE_KB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

export interface RestrictionResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

export interface CheckResults {
  passed: boolean;
  results: RestrictionResult[];
  sizeKB: number;
  minifiedSize: number;
  originalSizeKB: number;
}

export async function checkRestrictions(gameJsPath: string = './game.js'): Promise<CheckResults> {
  const results: RestrictionResult[] = [];
  let allPassed = true;

  // Read the game.js file
  let gameCode: string;
  try {
    gameCode = readFileSync(gameJsPath, 'utf-8');
  } catch (error) {
    return {
      passed: false,
      results: [{
        name: 'File Read',
        passed: false,
        message: `Failed to read ${gameJsPath}`,
        details: error instanceof Error ? error.message : String(error)
      }],
      sizeKB: 0,
      minifiedSize: 0,
      originalSizeKB: 0
    };
  }

  // Check 1: No import statements
  const hasImport = /\b(import|require)\s*\(/.test(gameCode) || /^import\s+/m.test(gameCode);
  results.push({
    name: 'No Imports',
    passed: !hasImport,
    message: hasImport ? 'Found import/require statements' : 'No imports detected'
  });
  if (hasImport) allPassed = false;

  // Check 2: No fetch or XMLHttpRequest
  const hasFetch = /\b(fetch|XMLHttpRequest|axios|ajax)\s*\(/.test(gameCode);
  results.push({
    name: 'No Network Calls',
    passed: !hasFetch,
    message: hasFetch ? 'Found network call patterns (fetch/XMLHttpRequest)' : 'No network calls detected'
  });
  if (hasFetch) allPassed = false;

  // Check 3: No external URLs (except data: URIs)
  const externalUrlPattern = /(https?:\/\/|\/\/[a-zA-Z0-9])/g;
  const lines = gameCode.split('\n');
  const urlMatches: string[] = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const matches = line.match(externalUrlPattern);
    if (matches) {
      matches.forEach(url => {
        const snippet = line.trim().substring(0, 80);
        urlMatches.push(`Line ${lineNum}: "${snippet}${line.length > 80 ? '...' : ''}"`);
      });
    }
  });

  const hasExternalUrl = urlMatches.length > 0;
  results.push({
    name: 'No External URLs',
    passed: !hasExternalUrl,
    message: hasExternalUrl ? `Found ${urlMatches.length} external URL(s)` : 'No external URLs detected',
    details: hasExternalUrl ? urlMatches.join('\n') : undefined
  });
  if (hasExternalUrl) allPassed = false;

  // Check 4: Warn on suspicious patterns (not a failure, just a warning)
  const hasSuspicious = /\b(eval|Function\s*\(|new\s+Function)\s*\(/.test(gameCode);
  results.push({
    name: 'Code Safety',
    passed: !hasSuspicious,
    message: hasSuspicious ? 'Warning: Found eval() or Function constructor' : 'No suspicious patterns detected',
    details: hasSuspicious ? 'These patterns are allowed but discouraged' : undefined
  });
  // Don't fail on suspicious patterns, just warn

  // Check 5: File size after minification
  let minifiedCode: string;
  let minifiedSize: number;

  try {
    const minifyResult = await minify(gameCode, {
      compress: true,
      mangle: true
    });
    
    minifiedCode = minifyResult.code || '';
    minifiedSize = Buffer.byteLength(minifiedCode, 'utf-8');
    const sizeKB = minifiedSize / 1024;

    results.push({
      name: 'Size Check',
      passed: minifiedSize <= MAX_SIZE_BYTES,
      message: minifiedSize <= MAX_SIZE_BYTES
        ? `${sizeKB.toFixed(2)} KB (under ${MAX_SIZE_KB} KB limit)`
        : `${sizeKB.toFixed(2)} KB (exceeds ${MAX_SIZE_KB} KB limit)`,
      details: `Original: ${(Buffer.byteLength(gameCode, 'utf-8') / 1024).toFixed(2)} KB, Minified: ${sizeKB.toFixed(2)} KB`
    });

    if (minifiedSize > MAX_SIZE_BYTES) allPassed = false;

  } catch (error) {
    minifiedSize = Buffer.byteLength(gameCode, 'utf-8');
    results.push({
      name: 'Size Check',
      passed: false,
      message: 'Failed to minify code',
      details: error instanceof Error ? error.message : String(error)
    });
    allPassed = false;
  }

  return {
    passed: allPassed,
    results,
    sizeKB: minifiedSize / 1024,
    minifiedSize,
    originalSizeKB: Buffer.byteLength(gameCode, 'utf-8') / 1024
  };
}
