import { Client, TransferTransaction, AccountId, Hbar, PrivateKey } from '@hashgraph/sdk';

// Source account (new account with 1000 HBAR)
const SOURCE_ACCOUNT = '0.0.8339668';
const SOURCE_KEY = '3030020100300706052b8104000a04220420d371a1d7212ae8b178709e8d797aebf4899904ae75b158066c594b0355de9363';

// Destination account (our main account)
const DEST_ACCOUNT = '0.0.8339596';

async function transfer() {
  const client = Client.forTestnet();
  const privateKey = PrivateKey.fromStringECDSA(SOURCE_KEY);
  client.setOperator(SOURCE_ACCOUNT, privateKey);

  const amount = 500; // Transfer 500 HBAR

  console.log(`Transferring ${amount} HBAR from ${SOURCE_ACCOUNT} to ${DEST_ACCOUNT}...`);

  const transaction = new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(SOURCE_ACCOUNT), Hbar.fromTinybars(-amount * 100_000_000))
    .addHbarTransfer(AccountId.fromString(DEST_ACCOUNT), Hbar.fromTinybars(amount * 100_000_000));

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  console.log('✅ Transfer successful!');
  console.log(`TX ID: ${response.transactionId.toString()}`);
  console.log(`HashScan: https://hashscan.io/testnet/transaction/${response.transactionId.toString()}`);

  client.close();
}

transfer().catch(console.error);
