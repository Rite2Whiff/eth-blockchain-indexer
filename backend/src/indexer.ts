import { prismaClient } from "./index";
import { Web3 } from "web3";

const web3 = new Web3(
  "https://eth-mainnet.g.alchemy.com/v2/DPqHCGmRFx72jtBUycraoC35qtBxi7B8"
);

export async function getNativeEthTransfers(blocknumber: number) {
  const wallets = await prismaClient.wallet.findMany({});
  const interestedAddresses = wallets.map((w) => w.depositAddress);

  const block = await web3.eth.getBlock(blocknumber, true);
  const transactions = block.transactions;

  const interestedTransactions = transactions.filter((tx: any) => {
    if (
      interestedAddresses.includes(tx.from) ||
      interestedAddresses.includes(tx.to)
    ) {
      return tx;
    } else {
      console.log("no transactions found");
      return;
    }
  });

  return interestedTransactions;
}
