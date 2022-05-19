const TonWeb = require("tonweb");

async function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
}

async function call(callback, attepts = 20, delayMs = 100) {
  if (typeof callback !== "function") {
    throw new Error("Callback is not a function");
  }

  let latestError;

  for (let i = 0; i < attepts; i++) {
    try {
      const response = await callback();
      return response;
    } catch (error) {
      latestError = error;
      delay(delayMs);
    }
  }

  throw latestError;
}

async function ensureSeqnoInc(seqno, wallet) {
  let seqIncremented = false;
  for (let i = 0; i < 5; i++) {
    await delay(8000);
    const newSeqno = await call(wallet.methods.seqno().call);
    if (newSeqno === seqno + 1) {
      seqIncremented = true;
      break;
    }
  }

  if (!seqIncremented) {
    throw new Error("Seqno wasn't incremented");
  }
}

// NFT Collection

async function getCollectionData(tonweb, collectionAddressString) {
  const result = await tonweb.provider.call2(
    collectionAddressString,
    "get_collection_data"
  );

  const nextItemIndex = result[0].toNumber();
  const collectionContentUri = parseOffchainUriCell(result[1]);
  const ownerAddress = parseAddress(result[2]);

  return { nextItemIndex, ownerAddress, collectionContentUri };
}

async function getNftItemAddressByIndex(
  tonweb,
  collectionAddressString,
  index
) {
  const result = await tonweb.provider.call2(
    collectionAddressString,
    "get_nft_address_by_index",
    [["num", index]]
  );

  return parseAddress(result);
}

function createNftItemMintBody(params) {
  const body = new TonWeb.boc.Cell();
  body.bits.writeUint(1, 32); // OP deploy new nft
  body.bits.writeUint(params.queryId || 0, 64); // query_id
  body.bits.writeUint(params.itemIndex, 64);
  body.bits.writeCoins(params.amount);

  const nftItemContent = new TonWeb.boc.Cell();
  nftItemContent.bits.writeAddress(params.itemOwnerAddress);

  const uriContent = new TonWeb.boc.Cell();
  uriContent.bits.writeBytes(serializeUri(params.itemContentUri));
  nftItemContent.refs[0] = uriContent;

  body.refs[0] = nftItemContent;
  return body;
}

// NFT Utils

const serializeUri = (uri) => {
  return new TextEncoder().encode(encodeURI(uri));
};

const parseUri = (bytes) => {
  return new TextDecoder().decode(bytes);
};

const parseOffchainUriCell = (cell) => {
  let length = 0;
  let c = cell;
  while (c) {
    length += c.bits.array.length;
    c = c.refs[0];
  }

  const bytes = new Uint8Array(length);
  length = 0;
  c = cell;
  while (c) {
    bytes.set(c.bits.array, length);
    length += c.bits.array.length;
    c = c.refs[0];
  }
  return parseUri(bytes.slice(1)); // slice OFFCHAIN_CONTENT_PREFIX
};

const parseAddress = (cell) => {
  let n = readIntFromBitString(cell.bits, 3, 8);
  if (n > BigInt(127)) {
    n = n - BigInt(256);
  }
  const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
  if (n.toString(10) + ":" + hashPart.toString(16) === "0:0") return null;
  const s = n.toString(10) + ":" + hashPart.toString(16).padStart(64, "0");
  return new TonWeb.utils.Address(s);
};

const readIntFromBitString = (bs, cursor, bits) => {
  let n = BigInt(0);
  for (let i = 0; i < bits; i++) {
    n *= BigInt(2);
    n += BigInt(bs.get(cursor + i));
  }
  return n;
};

module.exports = {
  call,
  ensureSeqnoInc,
  getCollectionData,
  getNftItemAddressByIndex,
  createNftItemMintBody,
};
