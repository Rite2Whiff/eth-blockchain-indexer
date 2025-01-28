import express from "express";
import { PrismaClient } from "@prisma/client";
import { MNEMONIC } from "./config";
import { HDNodeWallet, Wallet } from "ethers6";
import { mnemonicToSeedSync } from "bip39";
import { getNativeEthTransfers } from "./indexer";

const app = express();
app.use(express.json());

export const prismaClient = new PrismaClient();
const seed = mnemonicToSeedSync(MNEMONIC);

app.post("/signup", async (req, res) => {
  console.log("hello world");
  const username = req.body.username;
  const password = req.body.password;

  const user = await prismaClient.user.create({
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
  const hdNode = HDNodeWallet.fromSeed(seed);
  const child = hdNode.derivePath(`m/44'/60'/${userId}'/0`);
  const depositAddress = child.address;
  const privateKey = child.privateKey;

  await prismaClient.wallet.create({
    data: {
      depositAddress,
      privateKey,
      balance: 0,
      userId,
    },
  });

  console.log("wallet generated");
});

app.get("/depositAddress/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    res.json({
      message: "please provide the correct userId",
    });
    return;
  }

  const wallet = await prismaClient.wallet.findFirst({
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
});

app.listen(3000, () => {
  console.log("hello world");
  console.log("server is up and successfully running on port 3000");
  getNativeEthTransfers(21725984);
});
