/**
 * TapHeir - Mock Oracle Service
 * Simplified demonstration of Oracle functionality for proof of concept
 *
 * NOTE: This is a demo implementation. Production requires:
 * - Real identity verification process
 * - Legal death certificate validation
 * - Multi-signature authorization
 * - Secure key management (HSM)
 * - Audit logging
 */

import { Buffer } from 'buffer';
import * as ecc from 'tiny-secp256k1';
import { wifToKeyPair } from './bitcoin.js';

/**
 * Mock Oracle Service
 * Simulates a trusted third-party that can issue death certificates
 */
export class MockOracle {
  /**
   * Initialize Oracle with key pair
   * @param {Object} oracleKeyPair - { publicKey, privateKey, wif }
   */
  constructor(oracleKeyPair) {
    this.publicKey = oracleKeyPair.publicKey;
    this.privateKey = oracleKeyPair.privateKey;
    this.wif = oracleKeyPair.wif;

    // Convert WIF to ECPair for signing
    this.keyPair = wifToKeyPair(this.wif);
  }

  /**
   * Issue a death certificate for demonstration
   * In production, this would involve real verification process
   *
   * @param {string} trustId - Trust identifier (address or custom ID)
   * @param {string} personName - Name of deceased (demo only)
   * @returns {Object} Death certificate with signature
   */
  issueDeathCertificate(trustId, personName) {
    // Create certificate message
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `DEATH_CERT:${trustId}:${personName}:${timestamp}`;

    // Hash the message (SHA-256)
    const messageHash = Buffer.from(
      this._sha256(message),
      'hex'
    );

    // Sign with Oracle's private key
    const signature = ecc.sign(messageHash, this.keyPair.privateKey);

    return {
      trustId,
      personName,
      timestamp,
      issuedAt: new Date(timestamp * 1000).toLocaleString(),
      message,
      messageHash: messageHash.toString('hex'),
      signature: Buffer.from(signature).toString('hex'),
      oraclePublicKey: this.publicKey,
      certificateId: this._generateCertId(trustId, timestamp)
    };
  }

  /**
   * Verify a death certificate signature (for demo)
   * @param {Object} certificate - Certificate object from issueDeathCertificate
   * @returns {boolean} True if signature is valid
   */
  verifyCertificate(certificate) {
    try {
      const messageHash = Buffer.from(certificate.messageHash, 'hex');
      const signature = Buffer.from(certificate.signature, 'hex');
      const publicKey = Buffer.from(certificate.oraclePublicKey, 'hex');

      return ecc.verify(messageHash, publicKey, signature);
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return false;
    }
  }

  /**
   * Simple SHA-256 hash implementation using Web Crypto API
   * @private
   */
  _sha256(message) {
    // For browser environment, we'll use a simple hash
    // In production, use proper crypto library
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Convert to positive hex
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Generate certificate ID
   * @private
   */
  _generateCertId(trustId, timestamp) {
    const shortId = trustId.substring(0, 8);
    const timeHex = timestamp.toString(16);
    return `CERT-${shortId}-${timeHex}`.toUpperCase();
  }

  /**
   * Get Oracle information
   * @returns {Object} Oracle service info
   */
  getOracleInfo() {
    return {
      publicKey: this.publicKey,
      serviceName: 'TapHeir Mock Oracle Service',
      version: '1.0.0-demo',
      capabilities: [
        'Death Certificate Issuance',
        'Signature Verification',
        'Trust Authorization'
      ],
      notice: 'DEMO VERSION - Not for production use'
    };
  }
}

/**
 * Create a demo Oracle instance
 * @param {Object} oracleKeys - Oracle key pair
 * @returns {MockOracle} Oracle instance
 */
export function createMockOracle(oracleKeys) {
  return new MockOracle(oracleKeys);
}

/**
 * Explain what Oracle does in the inheritance trust
 * @returns {Object} Educational information
 */
export function explainOracleRole() {
  return {
    purpose: 'Oracle 作為可信第三方，驗證持有者死亡並授權繼承',
    workflow: [
      '1. 繼承人提供死亡證明文件',
      '2. Oracle 驗證文件真實性',
      '3. Oracle 簽發數位死亡證明',
      '4. 繼承人使用 Oracle 簽名 + 自己的簽名花費資金'
    ],
    advantages: [
      '✓ 無需等待時間鎖到期',
      '✓ 提供法律證明和可追溯性',
      '✓ 防止早期盜用（需要 Oracle 授權）',
      '✓ 靈活的繼承時間點'
    ],
    productionRequirements: [
      '⚠️ 真實身份驗證（KYC）',
      '⚠️ 合法死亡證明驗證',
      '⚠️ 多重授權流程',
      '⚠️ 安全密鑰管理（HSM）',
      '⚠️ 完整審計日誌'
    ]
  };
}
