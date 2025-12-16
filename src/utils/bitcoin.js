/**
 * TapHeir - Bitcoin Core Functionality
 * Minimal viable implementation for Bitcoin Testnet operations
 */

import { Buffer } from 'buffer';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';

// Make Buffer available globally for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

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

/**
 * Helper function to convert public key to x-only format
 * @param {Buffer|string} publicKey - Public key (Buffer or hex string)
 * @returns {Buffer} X-only public key (32 bytes)
 */
function toXOnlyPublicKey(publicKey) {
  const pubKeyBuffer = Buffer.isBuffer(publicKey)
    ? publicKey
    : Buffer.from(publicKey, 'hex');

  // Convert to x-only format (32 bytes, no prefix)
  if (pubKeyBuffer.length === 33) {
    // Remove prefix byte for compressed public key
    return pubKeyBuffer.subarray(1, 33);
  } else if (pubKeyBuffer.length === 65) {
    // For uncompressed public key, take bytes 1-33
    return pubKeyBuffer.subarray(1, 33);
  } else if (pubKeyBuffer.length === 32) {
    // Already x-only format
    return pubKeyBuffer;
  } else {
    throw new Error(`Invalid public key length: ${pubKeyBuffer.length}`);
  }
}

/**
 * Create a Taproot Trust with script tree
 * This implements a real inheritance trust with two spending paths:
 * 1. Timelock Path: Heir can spend after timelock expires
 * 2. Oracle Path: Oracle + Heir signatures required
 *
 * @param {Buffer|string} ownerPublicKey - Owner's public key
 * @param {Buffer|string} heirPublicKey - Heir's public key
 * @param {Buffer|string} oraclePublicKey - Oracle's public key
 * @param {number} timelockHours - Hours until timelock expires (default: 1 hour for demo)
 * @returns {Object} Complete Taproot trust information
 */
export function createTaprootTrust(ownerPublicKey, heirPublicKey, oraclePublicKey, timelockHours = 1) {
  // Convert all public keys to x-only format (32 bytes)
  const ownerXOnly = toXOnlyPublicKey(ownerPublicKey);
  const heirXOnly = toXOnlyPublicKey(heirPublicKey);
  const oracleXOnly = toXOnlyPublicKey(oraclePublicKey);

  // Calculate locktime (current time + specified hours)
  const currentTime = Math.floor(Date.now() / 1000);
  const locktime = currentTime + (timelockHours * 60 * 60);

  // Script Path 1: Timelock Script
  // This allows the heir to spend after the timelock expires
  // Script: <locktime> OP_CHECKLOCKTIMEVERIFY OP_DROP <heir_pubkey> OP_CHECKSIG
  const timelockScript = bitcoin.script.compile([
    bitcoin.script.number.encode(locktime),           // Push locktime onto stack
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,           // Verify locktime
    bitcoin.opcodes.OP_DROP,                          // Drop locktime from stack
    heirXOnly,                                        // Push heir's public key
    bitcoin.opcodes.OP_CHECKSIG                       // Verify heir's signature
  ]);

  // Script Path 2: Oracle Script (Simplified)
  // This requires both Oracle and Heir signatures
  // Script: <oracle_pubkey> OP_CHECKSIGVERIFY <heir_pubkey> OP_CHECKSIG
  const oracleScript = bitcoin.script.compile([
    oracleXOnly,                                      // Push oracle's public key
    bitcoin.opcodes.OP_CHECKSIGVERIFY,                // Verify oracle's signature (and remove from stack)
    heirXOnly,                                        // Push heir's public key
    bitcoin.opcodes.OP_CHECKSIG                       // Verify heir's signature (returns true/false)
  ]);

  // Create script tree with both paths
  // The tree structure allows either path to be used for spending
  const scriptTree = [
    {
      output: timelockScript,
      version: 192  // Tapscript version (0xc0)
    },
    {
      output: oracleScript,
      version: 192  // Tapscript version (0xc0)
    }
  ];

  // Create P2TR (Pay-to-Taproot) output with script tree
  // The owner's key is the internal key (key path spending)
  // The script tree provides alternative spending paths
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey: ownerXOnly,
    scriptTree: scriptTree,
    network
  });

  // Return complete trust information
  return {
    address: p2tr.address,                            // Taproot address (tb1p...)
    internalPubkey: ownerXOnly.toString('hex'),       // Owner's x-only public key
    heirPubkey: heirXOnly.toString('hex'),            // Heir's x-only public key
    oraclePubkey: oracleXOnly.toString('hex'),        // Oracle's x-only public key
    locktime: locktime,                               // Unix timestamp when timelock expires
    locktimeDate: new Date(locktime * 1000).toLocaleString(), // Human-readable date
    scripts: {
      timelock: timelockScript.toString('hex'),       // Timelock script (hex)
      oracle: oracleScript.toString('hex')            // Oracle script (hex)
    },
    output: p2tr.output.toString('hex'),              // Taproot output script
    witness: p2tr.witness ? p2tr.witness.map(w => w.toString('hex')) : [] // Witness data
  };
}

/**
 * Decode and explain a Taproot trust
 * Useful for debugging and displaying trust information
 *
 * @param {Object} trust - Trust object from createTaprootTrust
 * @returns {Object} Human-readable trust information
 */
export function explainTaprootTrust(trust) {
  const now = Math.floor(Date.now() / 1000);
  const timeUntilUnlock = trust.locktime - now;
  const hoursUntilUnlock = Math.floor(timeUntilUnlock / 3600);
  const minutesUntilUnlock = Math.floor((timeUntilUnlock % 3600) / 60);

  return {
    address: trust.address,
    network: 'Bitcoin Testnet',
    type: 'Taproot (P2TR) Inheritance Trust',
    spendingPaths: {
      keyPath: {
        description: 'Owner can spend immediately using internal key',
        pubkey: trust.internalPubkey
      },
      timelockPath: {
        description: `Heir can spend after ${hoursUntilUnlock}h ${minutesUntilUnlock}m`,
        pubkey: trust.heirPubkey,
        unlockTime: trust.locktimeDate,
        isUnlocked: timeUntilUnlock <= 0
      },
      oraclePath: {
        description: 'Oracle + Heir signatures required',
        oraclePubkey: trust.oraclePubkey,
        heirPubkey: trust.heirPubkey
      }
    }
  };
}
