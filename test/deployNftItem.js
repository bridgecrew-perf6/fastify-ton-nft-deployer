const t = require("tap");
const TonWeb = require("tonweb");
const TonMnemonic = require("tonweb-mnemonic");

const deployer = require("../deployer.js");

t.test("Should return wallet address from mnemonic", async (t) => {
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider(
      "https://testnet.toncenter.com/api/v2/jsonRPC?api_key=1a2a0eb3a25499b9fdac4727280d9531fa70b005af2f591d6bb7dba9a6a83186"
    )
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
  const keyPair = await TonMnemonic.mnemonicToKeyPair(walletMnemonic);
  const nftCollectionAddressString =
    "EQAAPx0Du6GrZHgJ2CX9ON25rUzb33den9EgJK90V9Uq8I3y";
  const nftItemIndex = await deployer.getNextItemIndex(
    tonweb,
    nftCollectionAddressString
  );
  const nftOwnerAddressString = (await wallet.getAddress()).toString(
    true,
    true,
    true
  );
  const nftItemContentUri = "007.json";

  const nftItemAddress = await deployer.deployNftItem(
    tonweb,
    keyPair,
    wallet,
    nftItemIndex,
    nftCollectionAddressString,
    nftOwnerAddressString,
    nftItemContentUri
  );

  t.ok(
    nftItemAddress.toString(true, true, true),
    `Deployed NFT Item address: ${nftItemAddress.toString(true, true, true)}`
  );
});
