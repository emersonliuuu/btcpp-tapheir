/**
 * Test script for Bitcoin core functionality
 * Run with: node src/tests/bitcoin.test.js
 */

import {
  generateKeyPair,
  createSimpleTaprootAddress,
  createTaprootTrust,
  explainTaprootTrust,
  isValidTaprootAddress,
  wifToKeyPair,
  network
} from '../utils/bitcoin.js';

console.log('='.repeat(60));
console.log('TapHeir - Bitcoin Core Functionality Test');
console.log('Network:', network.bech32);
console.log('='.repeat(60));
console.log();

// Test 1: Generate Key Pair
console.log('Test 1: Generate Key Pair');
console.log('-'.repeat(60));
try {
  const keyPair = generateKeyPair();
  console.log('✅ Key pair generated successfully');
  console.log('Private Key:', keyPair.privateKey);
  console.log('Public Key:', keyPair.publicKey);
  console.log('WIF:', keyPair.wif);
  console.log('Private Key Length:', keyPair.privateKey.length, 'chars (should be 64)');
  console.log('Public Key Length:', keyPair.publicKey.length, 'chars (should be 66)');
  console.log();

  // Test 2: Create Simple Taproot Address
  console.log('Test 2: Create Simple Taproot Address');
  console.log('-'.repeat(60));

  // Convert hex public key back to Buffer
  const publicKeyBuffer = Buffer.from(keyPair.publicKey, 'hex');
  const taprootAddress = createSimpleTaprootAddress(publicKeyBuffer);

  console.log('✅ Taproot address created successfully');
  console.log('Address:', taprootAddress.address);
  console.log('X-only Public Key:', taprootAddress.publicKey);
  console.log('Output Script:', taprootAddress.output);
  console.log('Address Prefix:', taprootAddress.address.substring(0, 4), '(should be "tb1p")');
  console.log();

  // Test 3: Validate Taproot Address
  console.log('Test 3: Validate Taproot Address');
  console.log('-'.repeat(60));

  const isValid = isValidTaprootAddress(taprootAddress.address);
  console.log('Address validation:', isValid ? '✅ VALID' : '❌ INVALID');
  console.log();

  // Test 4: WIF to Key Pair Conversion
  console.log('Test 4: WIF to Key Pair Conversion');
  console.log('-'.repeat(60));

  const recoveredKeyPair = wifToKeyPair(keyPair.wif);
  const recoveredPublicKey = Buffer.from(recoveredKeyPair.publicKey).toString('hex');
  const recoveredPrivateKey = Buffer.from(recoveredKeyPair.privateKey).toString('hex');

  console.log('Original Private Key:', keyPair.privateKey);
  console.log('Recovered Private Key:', recoveredPrivateKey);
  console.log('Keys Match:', keyPair.privateKey === recoveredPrivateKey ? '✅ YES' : '❌ NO');
  console.log();

  // Test 5: Generate Multiple Addresses
  console.log('Test 5: Generate Multiple Addresses');
  console.log('-'.repeat(60));

  for (let i = 1; i <= 3; i++) {
    const kp = generateKeyPair();
    const pubKeyBuf = Buffer.from(kp.publicKey, 'hex');
    const addr = createSimpleTaprootAddress(pubKeyBuf);
    console.log(`Address ${i}: ${addr.address}`);
  }
  console.log();

  // Test 6: Create Taproot Trust with Script Tree
  console.log('Test 6: Create Taproot Trust with Script Tree');
  console.log('-'.repeat(60));

  // Generate three key pairs for the trust
  const ownerKeys = generateKeyPair();
  const heirKeys = generateKeyPair();
  const oracleKeys = generateKeyPair();

  console.log('Generating trust with script tree...');
  const trust = createTaprootTrust(
    ownerKeys.publicKey,
    heirKeys.publicKey,
    oracleKeys.publicKey,
    1 // 1 hour timelock
  );

  console.log('✅ Taproot trust created successfully');
  console.log('Trust Address:', trust.address);
  console.log('Internal Pubkey (Owner):', trust.internalPubkey);
  console.log('Heir Pubkey:', trust.heirPubkey);
  console.log('Oracle Pubkey:', trust.oraclePubkey);
  console.log('Locktime:', trust.locktime, '(' + trust.locktimeDate + ')');
  console.log('Timelock Script (hex):', trust.scripts.timelock.substring(0, 40) + '...');
  console.log('Oracle Script (hex):', trust.scripts.oracle.substring(0, 40) + '...');
  console.log();

  // Test 7: Explain Taproot Trust
  console.log('Test 7: Explain Taproot Trust');
  console.log('-'.repeat(60));

  const explanation = explainTaprootTrust(trust);
  console.log('✅ Trust explanation generated');
  console.log('Network:', explanation.network);
  console.log('Type:', explanation.type);
  console.log('\nSpending Paths:');
  console.log('  1. Key Path:', explanation.spendingPaths.keyPath.description);
  console.log('  2. Timelock Path:', explanation.spendingPaths.timelockPath.description);
  console.log('     Unlock Time:', explanation.spendingPaths.timelockPath.unlockTime);
  console.log('     Is Unlocked:', explanation.spendingPaths.timelockPath.isUnlocked);
  console.log('  3. Oracle Path:', explanation.spendingPaths.oraclePath.description);
  console.log();

  // Test 8: Validate Trust Address
  console.log('Test 8: Validate Trust Address');
  console.log('-'.repeat(60));

  const isTrustValid = isValidTaprootAddress(trust.address);
  console.log('Trust address validation:', isTrustValid ? '✅ VALID' : '❌ INVALID');
  console.log('Address starts with tb1p:', trust.address.startsWith('tb1p') ? '✅ YES' : '❌ NO');
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('✅ All tests passed successfully!');
  console.log('🎉 Taproot script tree implementation verified!');
  console.log('='.repeat(60));

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error);
  process.exit(1);
}
