#!/bin/bash
# setup-testnet.sh - 快速配置 Hedera 测试网

echo "🚀 Hedera 测试网快速配置"
echo "═══════════════════════════════"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要 Node.js，请先安装"
    exit 1
fi

# 进入目录
cd "$(dirname "$0")"

# 1. 安装依赖
echo "📦 安装依赖..."
npm install --silent

# 2. 检查 .env
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  未找到 .env 文件"
    echo ""
    echo "请先完成以下步骤："
    echo ""
    echo "1. 访问 https://portal.hedera.com/faucet"
    echo "2. 输入你的 MetaMask 地址"
    echo "3. 记录获得的 Account ID (如 0.0.12345)"
    echo "4. 从钱包导出 Private Key"
    echo ""
    echo "然后创建 .env 文件："
    echo ""
    cat << 'EOF'
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
AUDIT_TOPIC_ID=0.0.YOUR_TOPIC_ID
POLICYGUARD_ENDPOINT=https://policyguard.openclaw.ai
PORT=3000
AUTO_APPROVE_LOW_RISK=false
EOF
    echo ""
    echo "复制以上内容到 .env 文件，填入你的真实信息"
    exit 1
fi

echo "✓ .env 文件存在"

# 3. 运行设置脚本
echo ""
echo "🔧 运行设置检查..."
npm run setup

echo ""
echo "═══════════════════════════════"
echo "配置完成！测试命令："
echo ""
echo "  npm run dev                    # 启动服务器"
echo "  npm run cli -- balance         # 查看余额"
echo "  npm run cli -- transfer 0.0.54321 5   # 测试转账"
echo ""
