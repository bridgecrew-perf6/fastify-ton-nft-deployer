const S = require("fluent-json-schema");
const TonWeb = require("tonweb");
const TonMnemonic = require("tonweb-mnemonic");

const deployer = require("./deployer.js");

const app = require("fastify")({
  logger: true,
});

const bodySchema = S.object()
  .prop("walletMnemonic", S.string().required())
  .prop("walletType", S.string().required())
  .prop("nftCollectionAddress", S.string().required())
  .prop("nftItemOwnerAddress", S.string())
  .prop("nftItemContentUri", S.string().required());

// Body: {
//   walletSeed: string
//   nftCollectionAddress: string,
//   nftOwnerAddress: string,
//   nftContentUri: string,
// }
//
// Response: {
//   nftAddress: string,
// }
//
app.post(
  "/deployNftItem",
  { schema: { body: bodySchema } },
  async (request, reply) => {
    const tonApiUrl = "https://testnet.toncenter.com/api/v2/jsonRPC";
    const tonApiKey = "1a2a0eb3a25499b9fdac4727280d9531fa70b005af2f591d6bb7dba9a6a83186";

    const tonweb = new TonWeb(new TonWeb.HttpProvider(`${tonApiUrl}?api_key=${tonApiKey}`));

    const walletMnemonicString = request.body.walletMnemonic;
    const walletMnemonic = walletMnemonicString.split(" ");

    if (walletMnemonic.length !== 24) {
      throw new Error("Invalid walletMnemonic");
    }

    const walletType = request.body.walletType;
    if (!["v3R1", "v3R2", "v4R1", "v4R2"].includes(walletType)) {
      throw new Error("Wallet is unsupported");
    }

    const wallet = await deployer.getWallet(tonweb, walletMnemonic, walletType);
    const keyPair = await TonMnemonic.mnemonicToKeyPair(walletMnemonic);

    const nftCollectionAddressString = request.body.nftCollectionAddress;

    const nftItemIndex = await deployer.getNextItemIndex(
      tonweb,
      nftCollectionAddressString
    );

    const nftOwnerAddressString = request.body.nftItemOwnerAddress
      ? request.body.nftItemOwnerAddress
      : (await wallet.getAddress()).toString(true, true, true);

    const nftItemContentUri = request.body.nftItemContentUri;

    const nftItemAddress = await deployer.deployNftItem(
      tonweb,
      keyPair,
      wallet,
      nftItemIndex,
      nftCollectionAddressString,
      nftOwnerAddressString,
      nftItemContentUri
    );

    reply.send({ nftItemAddress: nftItemAddress.toString(true, true, true) });
  }
);

app.listen(3000, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
