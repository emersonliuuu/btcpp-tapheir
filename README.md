# 🔐 TapHeir

**Privacy-First Bitcoin Inheritance Trust**

> Your keys, your rules, your legacy.

Built for Bitcoin++ Taipei 2025 Hackathon

---

## 💡 What is TapHeir?

TapHeir is a **self-sovereign Bitcoin inheritance solution** using Taproot's privacy features. It allows Bitcoin holders to securely pass assets to heirs without sacrificing privacy or requiring trusted third parties.

**The Problem:** $84B+ locked in inaccessible crypto wallets. Current solutions compromise privacy or sovereignty.

**The Solution:** Taproot-based trust with multiple unlock paths that look like normal transactions on-chain.

---

## ✨ Core Features

- 🔑 **Key Path Spending** - Owner uses funds normally (maximum privacy)
- ⏰ **Timelock Path** - Auto-unlocks after inactivity period
- 🔮 **Oracle Path** - Death certificate verification (demo)
- 🕵️ **Privacy-First** - Indistinguishable from regular Bitcoin addresses
- 🌐 **Self-Sovereign** - No third-party custody required

---

## 🏗️ Technical Architecture

### Taproot Script Tree

```
Taproot Address (tb1p...)
├─ Key Path: Owner's single signature
└─ Script Paths:
    ├─ Timelock: CHECKLOCKTIMEVERIFY + Heir signature
    └─ Oracle: Oracle signature + Heir signature
```

### Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Bitcoin:** bitcoinjs-lib, tiny-secp256k1, ecpair
- **Network:** Bitcoin Testnet
- **Privacy:** Taproot (BIP 341)

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/tapheir.git
cd tapheir

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Generate Trust** - Click "生成新信託" to create keypairs and Taproot address
2. **Fund Address** - Send testnet BTC to the generated address
3. **View Unlock Paths** - See three different spending scenarios
4. **Demo Oracle** - Simulate death certificate verification

---

## 🎯 How It Works

### 1. Trust Creation

- Generate keypairs for Owner, Heir, and Oracle
- Create Taproot address with embedded scripts
- Address looks like regular P2TR (privacy ✅)

### 2. Three Unlock Paths

**Path A: Normal Spending (Key Path)**

- Owner signs with their key
- Looks like standard transaction
- Full privacy maintained

**Path B: Timelock (Script Path 1)**

- Activates after 1 hour (demo) / 1 year (production)
- Heir can claim without owner interaction
- Automatic inheritance trigger

**Path C: Oracle Verification (Script Path 2)**

- Oracle validates death certificate
- Oracle + Heir signatures required
- Immediate unlock without waiting

### 3. Privacy Advantage

**Traditional Multisig:**

- ❌ Visible as special transaction
- ❌ Exposes participant count
- ❌ Clear inheritance setup

**TapHeir (Taproot):**

- ✅ Looks like normal address
- ✅ Only reveals used path when spending
- ✅ Key path spending = zero privacy leak

---

## 🔮 Oracle System

**Current:** Mock implementation for demo purposes

**Production Roadmap:**

- Integration with government death registries
- Multi-signature Oracle network (3-of-5)
- Decentralized verification (DLC future)

---

## 📊 Project Status

**Hackathon MVP:** ✅ Complete

- Taproot address generation ✅
- Script path compilation ✅
- Timelock mechanism ✅
- Mock Oracle ✅
- Web interface ✅

**Next Steps:**

- [ ] Mainnet deployment
- [ ] Hardware wallet integration
- [ ] Real Oracle API integration
- [ ] Mobile app (iOS/Android)
- [ ] Lightning Network support

---

## 🎓 Technical Highlights

### Why Taproot?

1. **Privacy by Default**

   - Script paths hidden until used
   - Key path spending indistinguishable from normal txs

2. **Flexible Scripts**

   - Support complex conditions (timelocks, multisig)
   - Efficient on-chain footprint

3. **Production-Ready**
   - Activated on Bitcoin mainnet (2021)
   - Well-tested, secure primitives

### Code Structure

```
tapheir/
├── src/
│   ├── App.jsx              # Main UI
│   ├── utils/
│   │   ├── bitcoin.js       # Core Bitcoin logic
│   │   ├── taproot.js       # Taproot implementation
│   │   └── oracle.js        # Mock Oracle service
│   └── index.css            # Tailwind styles
├── package.json
└── README.md
```

---

## ⚠️ Important Notes

### Testnet Only

This is a **hackathon demo** using Bitcoin Testnet. Do not use on mainnet without:

- Professional security audit
- Thorough testing
- Production Oracle implementation

### Security Considerations

- 🔒 Keep private keys secure (not for production use)
- 🔒 Timelock values should be carefully chosen
- 🔒 Oracle trust assumptions must be understood

---

## 🎤 Pitch Deck

**Market:** $1.2T Bitcoin market cap, 10% need estate planning = $120B TAM

**Traction Path:**

1. Launch with Bitcoin family offices
2. Partner with custody providers
3. Scale to retail users

**Revenue:** SaaS subscription ($10-100/month tiered pricing)

**Ask:** $500K pre-seed for 6-month runway

---

## 📚 Resources

- [Bitcoin++ Taipei](https://btcpp.dev/conf/taipei)
- [BIP 341 - Taproot](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki)
- [bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)
- [Testnet Faucet](https://testnet-faucet.mempool.co/)

---

## 👨‍💻 Author

**Emerson**

- Bitcoin++ Taipei 2025 Mentee
- Entrepreneur + Bitcoin Developer
- Previously: FitFood (tokenized fitness app)

---

## 📄 License

MIT License - Built for Bitcoin++ Taipei Hackathon

---

## 🙏 Acknowledgments

Special thanks to:

- Bitcoin++ organizers and mentors
- bitcoinjs-lib contributors
- Bitcoin developer community

---

**Built with ⚡ in 6 hours at Bitcoin++ Taipei 2025**

_"Every chain has a last block. Make sure yours leads somewhere."_
