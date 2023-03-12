const suijs = require("@mysten/sui.js");
const sha3 = require("sha3");
const bcs = require("@mysten/bcs");

const signer = "0xa38bc2aa63c34e37821f7abb34dbbe97b7ab2ea2";
const input_coins = ["0xc7e5500000000000000000000000000000000063"];

// this can be found by querrying a full node
const coin_ref = {
  objectId: "0xc7e5500000000000000000000000000000000063",
  version: 1,
  digest: "U3+dNJ9v/dKfEMADN07Q3gX9ws3ebmu+wd5htCU1y5c=", // this is SHA256 of the BCS of the object data
};

const getObjectRef = async (id) => {
  // JSON rpc client pointing to devnet fullnode
  const provider = new suijs.JsonRpcProvider(suijs.devnetConnection);
  const response = await provider.getObject(id);
  console.log(response.details.reference);
};
// getObjectRef("0xc7e5500000000000000000000000000000000063");
const tx = {
  PaySui: {
    coins: [coin_ref],
    recipients: ["0x6d94aeff6f16f1dc326be9865aa5ec14d2fb6f36"],
    amounts: ["20000"],
  },
};
const gasPayment = input_coins[0];

const transactionKind = { Single: tx };

const final_ = {
  messageVersion: 1,
  kind: transactionKind,
  sender: signer,
  gasData: {
    payment: coin_ref, // for paySui the first coin in input_coins is used for gas
    price: 1, // this is for devnet can be found with provider.getReferenceGasPrice()
    budget: 10000,
    owner: signer,
  },
  expiration: { None: null },
};

console.log(suijs.bcs.ser("TransactionData", final_).toBytes());
const getTransationBytes = async () => {
  const coin = "0xc7e5500000000000000000000000000000000063";
  const serializer = new suijs.RpcTxnDataSerializer(
    "https://fullnode.devnet.sui.io:443/"
  );
  const tr = {
    kind: "paySui",
    data: {
      inputCoins: [coin],
      recipients: ["0x6d94aeff6f16f1dc326be9865aa5ec14d2fb6f36"],
      amounts: [100000],
      gasBudget: 10000,
    },
  };
  const txb = await serializer.serializeToBytes(signer, tr, "Commit");

  return txb;
};
getTransationBytes().then((resp) => {
  console.log(resp);
});
// console.log(dataBytes)

