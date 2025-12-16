import { useState } from 'react';
import { generateKeyPair, createTaprootTrust, explainTaprootTrust } from './utils/bitcoin.js';
import { createMockOracle, explainOracleRole } from './utils/oracle.js';
import './App.css';

function App() {
  const [trust, setTrust] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deathCertificate, setDeathCertificate] = useState(null);
  const [oracleLoading, setOracleLoading] = useState(false);

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

  // Issue death certificate via Oracle (Demo)
  const issueOracleCertificate = () => {
    if (!trust) {
      alert('請先生成信託！');
      return;
    }

    try {
      setOracleLoading(true);

      // Create Oracle instance with the trust's oracle keys
      const oracle = createMockOracle(trust.oracle);

      // Issue death certificate for demo
      const certificate = oracle.issueDeathCertificate(
        trust.address,
        'Demo User'  // In production, this would be verified real name
      );

      setDeathCertificate(certificate);
      setOracleLoading(false);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('簽發證明時發生錯誤：' + error.message);
      setOracleLoading(false);
    }
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

        {/* Oracle Demo Section */}
        {trust && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mt-6 space-y-6 animate-fadeIn">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-purple-800 flex items-center">
                <span className="text-3xl mr-3">🔮</span>
                Oracle 演示功能
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                展示 Oracle 如何簽發死亡證明以授權早期繼承
              </p>
            </div>

            {/* Oracle Demo Button */}
            {!deathCertificate && (
              <div className="text-center py-6">
                <button
                  onClick={issueOracleCertificate}
                  disabled={oracleLoading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {oracleLoading ? '簽發中...' : '🔮 模擬 Oracle 簽發死亡證明'}
                </button>
                <p className="text-gray-500 text-xs mt-3">
                  💡 點擊按鈕模擬 Oracle 驗證並簽發證明
                </p>
              </div>
            )}

            {/* Death Certificate Display */}
            {deathCertificate && (
              <div className="space-y-4">
                {/* Demo Notice */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <p className="text-purple-900 font-semibold mb-1">
                    📋 這是演示版本
                  </p>
                  <p className="text-purple-700 text-sm">
                    生產環境需要：真實身份驗證、合法死亡證明驗證、多重授權流程、安全密鑰管理（HSM）
                  </p>
                </div>

                {/* Certificate Information */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-4 text-lg">
                    ✅ 數位死亡證明已簽發
                  </h3>

                  <div className="space-y-3 text-sm">
                    {/* Certificate ID */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">證明編號</p>
                      <code className="text-purple-700 font-mono text-xs">
                        {deathCertificate.certificateId}
                      </code>
                    </div>

                    {/* Trust ID */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">信託地址</p>
                      <code className="text-purple-700 font-mono text-xs break-all">
                        {deathCertificate.trustId}
                      </code>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">簽發時間</p>
                      <p className="text-purple-700">{deathCertificate.issuedAt}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Unix Timestamp: {deathCertificate.timestamp}
                      </p>
                    </div>

                    {/* Signature */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">Oracle 簽名</p>
                      <code className="text-purple-700 font-mono text-xs break-all block">
                        {truncateKey(deathCertificate.signature)}
                      </code>
                      <p className="text-gray-500 text-xs mt-2">
                        完整簽名長度: {deathCertificate.signature.length} 字符
                      </p>
                    </div>

                    {/* Oracle Public Key */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">Oracle 公鑰</p>
                      <code className="text-purple-700 font-mono text-xs break-all">
                        {truncateKey(deathCertificate.oraclePublicKey)}
                      </code>
                    </div>

                    {/* Message */}
                    <div className="bg-white/70 p-3 rounded">
                      <p className="text-gray-600 font-semibold mb-1">證明訊息</p>
                      <code className="text-purple-700 font-mono text-xs break-all block">
                        {deathCertificate.message}
                      </code>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded">
                  <h4 className="font-bold text-indigo-900 mb-2">🔐 下一步：使用證明花費資金</h4>
                  <div className="text-indigo-800 text-sm space-y-1">
                    <p>1. 繼承人準備交易，使用「Oracle Path」花費腳本</p>
                    <p>2. 附加 Oracle 簽名（來自此證明）</p>
                    <p>3. 附加繼承人自己的簽名</p>
                    <p>4. 廣播交易到 Bitcoin Testnet</p>
                    <p className="text-indigo-600 mt-2">
                      💡 此 Demo 展示了 Oracle 簽名的生成，實際花費需要構建完整的 PSBT 交易
                    </p>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="text-center">
                  <button
                    onClick={() => setDeathCertificate(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition text-sm"
                  >
                    重新簽發證明
                  </button>
                </div>
              </div>
            )}

            {/* Oracle Role Explanation */}
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border-l-4 border-cyan-500 p-4 rounded">
              <h4 className="font-bold text-cyan-900 mb-2">📚 Oracle 在遺產信託中的角色</h4>
              <div className="text-cyan-800 text-sm space-y-2">
                <p><strong>目的：</strong>Oracle 作為可信第三方，驗證持有者死亡並授權繼承</p>
                <div className="pl-4">
                  <p className="font-semibold mt-2">工作流程：</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>繼承人提供死亡證明文件</li>
                    <li>Oracle 驗證文件真實性</li>
                    <li>Oracle 簽發數位死亡證明</li>
                    <li>繼承人使用 Oracle 簽名 + 自己的簽名花費資金</li>
                  </ol>
                  <p className="font-semibold mt-2">優勢：</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>無需等待時間鎖到期</li>
                    <li>提供法律證明和可追溯性</li>
                    <li>防止早期盜用（需要 Oracle 授權）</li>
                    <li>靈活的繼承時間點</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
