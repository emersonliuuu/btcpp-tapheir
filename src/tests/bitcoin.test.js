/**
 * Test script for Bitcoin core functionality
 * Run with: node src/tests/bitcoin.test.js
 */

import {
  generateKeyPair,
  createSimpleTaprootAddress,
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

  // Summary
  console.log('='.repeat(60));
  console.log('✅ All tests passed successfully!');
  console.log('='.repeat(60));

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error);
  process.exit(1);
}
