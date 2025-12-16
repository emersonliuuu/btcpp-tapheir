import { useState } from 'react';
import { generateKeyPair, createTaprootTrust, explainTaprootTrust } from './utils/bitcoin.js';
import './App.css';

function App() {
  const [trust, setTrust] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate new trust with three key pairs and script tree
  const generateTrust = () => {
    try {
      setLoading(true);

      // Generate three key pairs: owner, heir, oracle
      const ownerKeys = generateKeyPair();
      const heirKeys = generateKeyPair();
      const oracleKeys = generateKeyPair();

      // Create Taproot trust with script tree (1 hour timelock for demo)
      const taprootTrust = createTaprootTrust(
        ownerKeys.publicKey,
        heirKeys.publicKey,
        oracleKeys.publicKey,
        1 // 1 hour timelock
      );

      // Get human-readable explanation
      const trustExplanation = explainTaprootTrust(taprootTrust);

      // Create enhanced trust object with all information
      const newTrust = {
        address: taprootTrust.address,
        locktime: taprootTrust.locktime,
        locktimeDate: taprootTrust.locktimeDate,
        scripts: taprootTrust.scripts,
        explanation: trustExplanation,
        owner: {
          publicKey: ownerKeys.publicKey,
          privateKey: ownerKeys.privateKey,
          wif: ownerKeys.wif
        },
        heir: {
          publicKey: heirKeys.publicKey,
          privateKey: heirKeys.privateKey,
          wif: heirKeys.wif
        },
        oracle: {
          publicKey: oracleKeys.publicKey,
          privateKey: oracleKeys.privateKey,
          wif: oracleKeys.wif
        },
        createdAt: new Date().toLocaleString()
      };

      setTrust(newTrust);
      setLoading(false);
    } catch (error) {
      console.error('Error generating trust:', error);
      alert('生成信託時發生錯誤：' + error.message);
      setLoading(false);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Truncate public key for display
  const truncateKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 16)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            🔐 TapHeir
          </h1>
          <p className="text-xl text-gray-700">
            Bitcoin Inheritance Trust
          </p>
          <p className="text-sm text-gray-500 mt-2">
            使用 Taproot 技術的比特幣遺產信託
          </p>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={generateTrust}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '生成中...' : '🚀 生成新信託'}
          </button>
        </div>

        {/* Trust Information Card */}
        {trust && (
          <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6 animate-fadeIn">
            {/* Success Message */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center">
                <span className="text-2xl mr-2">✅</span>
                <div>
                  <p className="text-green-800 font-semibold">信託創建成功！</p>
                  <p className="text-green-600 text-sm">您的比特幣遺產信託已在測試網上建立</p>
                </div>
              </div>
            </div>

            {/* Trust Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                📍 信託地址（Testnet）
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm break-all font-mono">
                  {trust.address}
                </code>
                <button
                  onClick={() => copyToClipboard(trust.address)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition flex-shrink-0"
                  title="複製地址"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm mt-1">✓ 已複製到剪貼板</p>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Owner Key */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  👤 持有者
                </h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">公鑰:</p>
                  <code className="text-xs bg-white p-2 rounded block break-all">
                    {truncateKey(trust.owner.publicKey)}
                  </code>
                </div>
              </div>

              {/* Heir Key */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  👨‍👩‍👧‍👦 繼承人
                </h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">公鑰:</p>
                  <code className="text-xs bg-white p-2 rounded block break-all">
                    {truncateKey(trust.heir.publicKey)}
                  </code>
                </div>
              </div>

              {/* Oracle Key */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                  🔮 Oracle
                </h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">公鑰:</p>
                  <code className="text-xs bg-white p-2 rounded block break-all">
                    {truncateKey(trust.oracle.publicKey)}
                  </code>
                </div>
              </div>
            </div>

            {/* Script Tree Information */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-3">🌳 Taproot Script Tree</h3>
              <div className="space-y-3 text-sm">
                {/* Key Path */}
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-700 mb-1">🔑 Key Path (持有者直接花費)</p>
                  <p className="text-gray-600 text-xs">
                    {trust.explanation?.spendingPaths?.keyPath?.description}
                  </p>
                </div>

                {/* Timelock Path */}
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-700 mb-1">⏰ Timelock Path (時間鎖路徑)</p>
                  <p className="text-gray-600 text-xs mb-1">
                    {trust.explanation?.spendingPaths?.timelockPath?.description}
                  </p>
                  <p className="text-indigo-600 text-xs font-mono">
                    🔓 解鎖時間: {trust.locktimeDate}
                  </p>
                </div>

                {/* Oracle Path */}
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-700 mb-1">🔮 Oracle Path (預言機路徑)</p>
                  <p className="text-gray-600 text-xs">
                    {trust.explanation?.spendingPaths?.oraclePath?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 text-center">
                ⏰ 創建時間: {trust.createdAt}
              </p>
            </div>

            {/* Enhanced Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 text-sm">
                ℹ️ <strong>新功能：</strong>此信託已包含完整的 Taproot script tree，支持三種花費路徑：
                持有者直接花費、1小時後繼承人花費、或 Oracle + 繼承人聯合花費。
              </p>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>注意：</strong>請妥善保存所有私鑰信息。這是測試網環境，僅供開發測試使用。
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!trust && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              點擊上方按鈕開始創建您的比特幣遺產信託
            </p>
            <div className="text-left space-y-2 text-sm text-gray-500 max-w-2xl mx-auto">
              <p>✨ <strong>功能說明：</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>自動生成持有者、繼承人和 Oracle 的密鑰對</li>
                <li>創建 Taproot (P2TR) 地址於 Bitcoin Testnet</li>
                <li>✅ 實現完整的 Taproot script tree</li>
                <li>✅ 時間鎖花費路徑 (OP_CHECKLOCKTIMEVERIFY)</li>
                <li>✅ Oracle + 繼承人雙簽名路徑</li>
                <li>✅ 持有者直接花費路徑 (key path)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
