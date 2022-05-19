const t = require("tap");
const TonWeb = require("tonweb");

const deployer = require("../deployer.js");

t.test("Should return wallet address from mnemonic", async (t) => {
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
  );

  const walletMnemonic = [
    "curious",
    "father",
    "slam",
    "credit",
    "rally",
    "horse",
    "flame",
    "isolate",
    "inner",
    "story",
    "seven",
    "rack",
    "miracle",
    "diamond",
    "release",
    "siren",
    "rug",
    "milk",
    "supply",
    "elevator",
    "athlete",
    "symbol",
    "despair",
    "sign",
  ];
  const walletType = "v3R2";

  const wallet = await deployer.getWallet(tonweb, walletMnemonic, walletType);
  const walletAddress = await wallet.getAddress();

  t.equal(
    walletAddress.toString(true, true, true),
    "EQAO3HRa-3WL-X8L-XMKhXuiqpm_Hhi1t707cE9GeXoIh9ab"
  );
});
