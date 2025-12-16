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

            {/* Spending Paths Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💰 花費路徑（Spending Paths）</h3>

              <div className="space-y-4">
                {/* Key Path */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🔑</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 mb-2">Key Path - 持有者直接花費</h4>
                      <p className="text-blue-800 text-sm mb-2">
                        持有者可以隨時使用內部密鑰直接花費，無需揭露任何腳本。
                      </p>
                      <div className="bg-white/70 p-2 rounded text-xs space-y-1">
                        <p className="text-blue-700">✓ <strong>隱私性最佳：</strong>看起來像普通交易</p>
                        <p className="text-blue-700">✓ <strong>費用最低：</strong>不需要額外的腳本數據</p>
                        <p className="text-blue-700">✓ <strong>立即可用：</strong>無需等待時間鎖</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timelock Path */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⏰</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 mb-2">Script Path 1 - 時間鎖路徑</h4>
                      <p className="text-green-800 text-sm mb-2">
                        時間鎖到期後，繼承人可以單獨使用自己的簽名花費。
                      </p>
                      <div className="bg-white/70 p-2 rounded text-xs space-y-1">
                        <p className="text-green-700">🔓 <strong>解鎖時間：</strong>{trust.locktimeDate}</p>
                        <p className="text-green-700">📜 <strong>使用腳本：</strong>OP_CHECKLOCKTIMEVERIFY</p>
                        <p className="text-green-700">👨‍👩‍👧‍👦 <strong>需要簽名：</strong>繼承人單獨簽名</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oracle Path */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🔮</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-900 mb-2">Script Path 2 - Oracle 驗證路徑</h4>
                      <p className="text-purple-800 text-sm mb-2">
                        在時間鎖到期前，需要 Oracle 和繼承人共同簽名才能花費。
                      </p>
                      <div className="bg-white/70 p-2 rounded text-xs space-y-1">
                        <p className="text-purple-700">🔐 <strong>雙重驗證：</strong>Oracle + 繼承人簽名</p>
                        <p className="text-purple-700">📜 <strong>使用腳本：</strong>OP_CHECKSIGVERIFY + OP_CHECKSIG</p>
                        <p className="text-purple-700">🚨 <strong>緊急使用：</strong>需經 Oracle 授權的早期繼承</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Advantage */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-4 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🛡️</span>
                <div>
                  <h4 className="font-bold text-cyan-900 mb-2">Taproot 隱私優勢</h4>
                  <div className="text-cyan-800 text-sm space-y-1">
                    <p>✓ <strong>鏈上看起來像普通地址：</strong>所有 Taproot 地址格式相同（tb1p...）</p>
                    <p>✓ <strong>只在花費時暴露使用的路徑：</strong>未使用的腳本永遠不會公開</p>
                    <p>✓ <strong>Key Path 最隱私：</strong>如果持有者直接花費，完全看不出有其他選項</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testnet Faucet Info */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💧</span>
                <div className="flex-1">
                  <h4 className="font-bold text-yellow-900 mb-2">獲取測試幣</h4>
                  <p className="text-yellow-800 text-sm mb-3">
                    這是 Bitcoin Testnet 地址，您可以從以下來源獲取免費測試幣：
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://coinfaucet.eu/en/btc-testnet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/70 p-2 rounded text-sm text-yellow-700 hover:bg-white transition"
                    >
                      🚰 <strong>Coinfaucet：</strong>https://coinfaucet.eu/en/btc-testnet/
                    </a>
                    <a
                      href={`https://blockstream.info/testnet/address/${trust.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/70 p-2 rounded text-sm text-yellow-700 hover:bg-white transition"
                    >
                      🔍 <strong>查看此地址：</strong>Blockstream Testnet Explorer
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 text-center">
                ⏰ 創建時間: {trust.createdAt}
              </p>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-800 text-sm">
                ⚠️ <strong>安全提醒：</strong>請妥善保存所有私鑰（WIF 格式）。遺失私鑰將無法花費資金。這是測試網環境，僅供開發測試使用。
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
