"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNativeEthTransfers = getNativeEthTransfers;
const index_1 = require("./index");
const web3_1 = require("web3");
const web3 = new web3_1.Web3("https://eth-mainnet.g.alchemy.com/v2/DPqHCGmRFx72jtBUycraoC35qtBxi7B8");
function getNativeEthTransfers(blocknumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallets = yield index_1.prismaClient.wallet.findMany({});
        const interestedAddresses = wallets.map((w) => w.depositAddress);
        const block = yield web3.eth.getBlock(blocknumber, true);
        const transactions = block.transactions;
        const interestedTransactions = transactions.filter((tx) => {
            if (interestedAddresses.includes(tx.from) ||
                interestedAddresses.includes(tx.to)) {
                return tx;
            }
            else {
                console.log("no transactions found");
                return;
            }
        });
        console.log(interestedTransactions);
        return interestedTransactions;
    });
}
