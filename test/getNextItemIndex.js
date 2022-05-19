const t = require("tap");
const TonWeb = require("tonweb");

const deployer = require("../deployer.js");

t.test("Should return the next item index", async (t) => {
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
  );

  const collectionAddress = "EQAAPx0Du6GrZHgJ2CX9ON25rUzb33den9EgJK90V9Uq8I3y";
  const nextItemIndex = await deployer.getNextItemIndex(
    tonweb,
    collectionAddress
  );

  t.ok(Number.isInteger(nextItemIndex));
});
