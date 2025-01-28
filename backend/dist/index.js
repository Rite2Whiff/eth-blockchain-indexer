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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const ethers6_1 = require("ethers6");
const bip39_1 = require("bip39");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prismaClient = new client_1.PrismaClient();
const seed = (0, bip39_1.mnemonicToSeedSync)(config_1.MNEMONIC);
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello world");
    const username = req.body.username;
    const password = req.body.password;
    const user = yield prismaClient.user.create({
        data: {
            username,
            password,
        },
    });
    if (!user) {
        res.json({
            message: "Unable to create the user",
        });
        return;
    }
    res.json({
        id: user.id,
        message: "user successfully signed up",
    });
    const userId = user.id;
    const hdNode = ethers6_1.HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(`m/44'/60'/${userId}'/0`);
    const depositAddress = child.address;
    const privateKey = child.privateKey;
    yield prismaClient.wallet.create({
        data: {
            depositAddress,
            privateKey,
            balance: 0,
            userId,
        },
    });
    console.log("wallet generated");
}));
app.get("/depositAddress/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.query.userId);
    if (!userId) {
        res.json({
            message: "please provide the correct userId",
        });
        return;
    }
    const wallet = yield prismaClient.wallet.findFirst({
        where: {
            userId,
        },
    });
    if (!wallet) {
        res.json({
            message: "wallet not found",
        });
        return;
    }
    res.json({
        depositAddress: wallet.depositAddress,
    });
}));
app.listen(3000, () => {
    console.log("server is up and successfully running on port 3000");
});
