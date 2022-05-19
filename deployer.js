const TonWeb = require("tonweb");
const TonMnemonic = require("tonweb-mnemonic");
const BN = require("bn.js");

const api = require("./api.js");

async function getWallet(tonweb, walletMnemonic, walletType) {
  if (!walletMnemonic) {
    throw new Error("walletMnemonic not found");
  } else if (walletMnemonic.length !== 24) {
    throw new Error("Invalid walletMnemonic");
  }

  const keyPair = await TonMnemonic.mnemonicToKeyPair(walletMnemonic);

  if (!walletType) {
    throw new Error("WalletType not found");
  } else if (
    walletType !== "v3R1" &&
    walletType !== "v3R2" &&
    walletType !== "v4R1" &&
    walletType !== "v4R2"
  ) {
    throw new Error("WalletType unknown error");
  }

  const WalletClass = tonweb.wallet.all[walletType];

  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });

  return wallet;
}

async function getNextItemIndex(tonweb, collectionAddressString) {
  if (!collectionAddressString) {
    throw new Error("collectionAddress not found");
  }

  const collectionData = await api.call(() =>
    api.getCollectionData(tonweb, collectionAddressString)
  );

  if (collectionData.collectionContentUri === "") {
    throw new Error("Collection not found");
  }

  return collectionData.nextItemIndex;
}

// deployerAddress: TonWeb.utils.Address
async function checkDeployerBalance(tonweb, deployerAddress) {
  if (!deployerAddress) {
    throw new Error("deployerAddress not found");
  }

  const balanceString = await tonweb.getBalance(deployerAddress);

  if (typeof balanceString !== "string") {
    throw new Error("Unable to get balance");
  }

  const ONE_TON = new BN("1000000000");
  const balance = new BN(balanceString);

  if (balance.lt(ONE_TON)) {
    throw new Error("Deployer balance is insufficient (Min balance 1 TON)");
  }
}

async function checkCollectionBalance(tonweb, collectionAddress) {
  if (!collectionAddress) {
    throw new Error("deployerAddress not found");
  }

  const balanceString = await tonweb.getBalance(collectionAddress);

  if (typeof balanceString !== "string") {
    throw new Error("Unable to get balance");
  }

  const ONE_TON = new BN("1000000000");
  const balance = new BN(balanceString);

  if (balance.lt(ONE_TON)) {
    throw new Error("Collection balance is insufficient (Min balance 1 TON)");
  }
}

// ATTENTION! This function doen't check if NFT Item with nftItemIndex already exists.
async function deployNftItem(
  tonweb,
  keyPair,
  wallet,
  nftItemIndex,
  nftCollectionAddressString,
  nftOwnerAddressString,
  nftItemContentUri
) {
  const secretKey = keyPair.secretKey;
  const nftCollectionAddress = new TonWeb.utils.Address(
    nftCollectionAddressString
  );

  const amount = TonWeb.utils.toNano(0.05);

  const seqno = await api.call(wallet.methods.seqno().call);

  if (typeof seqno !== "number" || seqno === 0) {
    throw new Error("Invalid seqno");
  }

  const nftItemMintBody = api.createNftItemMintBody({
    amount,
    itemIndex: nftItemIndex,
    itemOwnerAddress: nftOwnerAddressString
      ? new TonWeb.utils.Address(nftOwnerAddressString)
      : await wallet.getAddress(),
    itemContentUri: nftItemContentUri,
  });

  await api.call(() => {
    wallet.methods
      .transfer({
        secretKey: secretKey,
        toAddress: nftCollectionAddress,
        amount: amount,
        seqno: seqno,
        payload: nftItemMintBody,
        sendMode: 3,
      })
      .send();
  });

  await api.ensureSeqnoInc(seqno, wallet);

  const nftItemAddress = await api.getNftItemAddressByIndex(
    tonweb,
    nftCollectionAddressString,
    nftItemIndex
  );

  return nftItemAddress;
}

module.exports = {
  getWallet,
  getNextItemIndex,
  checkDeployerBalance,
  checkCollectionBalance,
  deployNftItem,
};
