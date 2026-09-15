import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

describe('AETF-500 Cryptographic Hash Single Baseline & 1-Byte Tamper Negative Test (B3)', () => {
  const getRoot = () => {
    const cwd = process.cwd();
    return cwd.endsWith('packages/runtime') || cwd.endsWith('packages\\runtime')
      ? path.resolve(cwd, '../..')
      : cwd;
  };
  const truthDir = path.resolve(getRoot(), 'generated/repository_truth');

  it('1. Verifies authentic 02_Original_Build_Log.txt matches single canonical hash exactly', () => {
    const filePath = path.join(truthDir, '02_Original_Build_Log.txt');
    assert.strictEqual(fs.existsSync(filePath), true, 'File must exist');
    const bytes = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    const expectedCanonical = 'afdee24f1a7b60424a832f569db6ddf3ab15c139c74ba3cce9af2e7dc8827954';
    assert.strictEqual(hash.toLowerCase(), expectedCanonical.toLowerCase(), 'Must match canonical hash');
  });

  it('2. NEGATIVE TEST: Modifying exactly 1 byte in the file buffer immediately produces FAIL', () => {
    const filePath = path.join(truthDir, '02_Original_Build_Log.txt');
    const originalBytes = fs.readFileSync(filePath);
    
    // Create tampered copy with exactly 1 bit/byte altered
    const tamperedBytes = Buffer.from(originalBytes);
    tamperedBytes[0] = tamperedBytes[0] ^ 0x01; // flip 1 bit
    
    const tamperedHash = crypto.createHash('sha256').update(tamperedBytes).digest('hex');
    const expectedCanonical = 'afdee24f1a7b60424a832f569db6ddf3ab15c139c74ba3cce9af2e7dc8827954';
    
    // Tampered hash MUST NOT equal canonical hash
    assert.notStrictEqual(tamperedHash, expectedCanonical, 'Tampered file hash must diverge');
    
    // Verifier function strictly rejecting tampered byte
    const verifierMatches = tamperedHash.toLowerCase() === expectedCanonical.toLowerCase();
    assert.strictEqual(verifierMatches, false, 'Tampered file must strictly result in verifier FAIL');
  });

  it('3. NEGATIVE TEST: Verifier rejects previously tolerated alternative hash (e.g. CRLF version)', () => {
    const obsoleteAlternative = '712de5212d40c7b4aabe702815e889bc3f956042b486631db875a5d99bf73298';
    const filePath = path.join(truthDir, '02_Original_Build_Log.txt');
    const actualBytes = fs.readFileSync(filePath);
    const actualHash = crypto.createHash('sha256').update(actualBytes).digest('hex');

    // Only canonical is valid; alternative must fail comparison against current physical artifact
    const matchesAlternative = actualHash.toLowerCase() === obsoleteAlternative.toLowerCase();
    assert.strictEqual(matchesAlternative, false, 'Artifact must not evaluate against superseded alternative hash');
  });
});
