# Fastify TON NFT Deployer

### How to start:

- `git clone https://github.com/pantemon/fastify-ton-nft-deployer.git`
- `cd ./fastify-ton-nft-deployer && yarn`
- `yarn start`

### How to deploy NFT:
- `chmod +x ./scripts/* && ./scripts/deploy_nft_item.sh`

### Request schema:

`{
  walletMnemonic: string,
  walletType: string,
  nftCollectionAddress: string,
  nftItemOwnerAddress: string,
  nftItemContentUri: string
}`

### Response schema:

`{
  nftItemAddress: string
}`
