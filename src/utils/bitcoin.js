/**
 * TapHeir - Bitcoin Core Functionality
 * Minimal viable implementation for Bitcoin Testnet operations
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';

// Initialize bitcoinjs-lib with ECC library
bitcoin.initEccLib(ecc);

// Initialize ECPair with tiny-secp256k1
const ECPair = ECPairFactory(ecc);

// Use Bitcoin Testnet
export const network = bitcoin.networks.testnet;

/**
 * Generate a random Bitcoin key pair
 * @returns {Object} { privateKey: hex string, publicKey: hex string, wif: WIF format }
 */
export function generateKeyPair() {
  // Generate random key pair
  const keyPair = ECPair.makeRandom({ network });

  // Ensure we convert to Buffer first, then to hex
  const privateKeyBuffer = Buffer.from(keyPair.privateKey);
  const publicKeyBuffer = Buffer.from(keyPair.publicKey);

  return {
    privateKey: privateKeyBuffer.toString('hex'),
    publicKey: publicKeyBuffer.toString('hex'),
    wif: keyPair.toWIF()
  };
}

/**
 * Create a simple Taproot (P2TR) address
 * This is a basic implementation without complex script trees
 *
 * @param {Buffer} ownerPublicKey - Owner's public key in Buffer format
 * @returns {Object} { address: testnet address (tb1p...), publicKey: hex string }
 */
export function createSimpleTaprootAddress(ownerPublicKey) {
  // Ensure we have a Buffer
  const pubKeyBuffer = Buffer.isBuffer(ownerPublicKey)
    ? ownerPublicKey
    : Buffer.from(ownerPublicKey);

  // Convert public key to x-only format (32 bytes, no prefix)
  // For Taproot, we need the x-only public key (schnorr format)
  // Compressed public keys are 33 bytes with a prefix byte (02 or 03)
  let xOnlyPubKey;
  if (pubKeyBuffer.length === 33) {
    // Remove the prefix byte for compressed public key
    xOnlyPubKey = pubKeyBuffer.subarray(1, 33);
  } else if (pubKeyBuffer.length === 65) {
    // For uncompressed public key (65 bytes), take bytes 1-33 (skip the 04 prefix)
    xOnlyPubKey = pubKeyBuffer.subarray(1, 33);
  } else if (pubKeyBuffer.length === 32) {
    // Already x-only format
    xOnlyPubKey = pubKeyBuffer;
  } else {
    throw new Error(`Invalid public key length: ${pubKeyBuffer.length}. Expected 32, 33, or 65 bytes.`);
  }

  // Create P2TR (Pay-to-Taproot) output
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPubKey,
    network
  });

  return {
    address: p2tr.address,
    publicKey: xOnlyPubKey.toString('hex'),
    output: p2tr.output.toString('hex')
  };
}

/**
 * Verify if an address is a valid Taproot address
 * @param {string} address - Bitcoin address to verify
 * @returns {boolean} true if valid Taproot address
 */
export function isValidTaprootAddress(address) {
  try {
    // Taproot testnet addresses start with 'tb1p'
    if (!address.startsWith('tb1p')) {
      return false;
    }

    // Try to decode the address
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert WIF (Wallet Import Format) to key pair
 * @param {string} wif - Private key in WIF format
 * @returns {Object} ECPair key pair object
 */
export function wifToKeyPair(wif) {
  return ECPair.fromWIF(wif, network);
}
