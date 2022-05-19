const t = require("tap");
const TonWeb = require("tonweb");

const deployer = require("../deployer.js");

t.test("Collection balance should be more then 1 TON", async (t) => {
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
  );

  const collectionAddressString =
    "EQAAPx0Du6GrZHgJ2CX9ON25rUzb33den9EgJK90V9Uq8I3y";
  const collectionAddress = new TonWeb.utils.Address(collectionAddressString);

  t.doesNotThrow(
    async () => deployer.checkCollectionBalance(tonweb, collectionAddress),
    {}
  );
});
