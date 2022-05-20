curl \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "walletMnemonic":"curious father slam credit rally horse flame isolate inner story seven rack miracle diamond release siren rug milk supply elevator athlete symbol despair sign", "walletType":"v3R2", "nftCollectionAddress":"EQAAPx0Du6GrZHgJ2CX9ON25rUzb33den9EgJK90V9Uq8I3y", "nftItemOwnerAddress":"EQAO3HRa-3WL-X8L-XMKhXuiqpm_Hhi1t707cE9GeXoIh9ab", "nftItemContentUri":"007.json" }' \
  http://localhost:3000/deployNftItem