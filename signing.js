// imports
const suijs = require("@mysten/sui.js");

const privKey = [
    64, 33, 18, 129, 136, 164, 29, 72, 239, 96, 52, 154, 150, 171, 75, 60, 77, 41,
    39, 97, 102, 68, 153, 22, 250, 49, 38, 5, 66, 251, 14, 128,
  ];
  const publicKeyArray = [
    98, 83, 175, 119, 149, 218, 4, 236, 112, 227, 24, 192, 205, 26, 178, 52, 179,
    39, 31, 72, 2, 16, 223, 13, 82, 197, 48, 195, 115, 45, 29, 139,
  ];

// set our address directly, no need to derive it
const address = "0xa38bc2aa63c34e37821f7abb34dbbe97b7ab2ea2";
// construct the keypair
const keypair = suijs.Ed25519Keypair.fromSecretKey(Uint8Array.from(privKey));

// JSON rpc client pointing to devnet fullnode
const provider = new suijs.JsonRpcProvider(suijs.devnetConnection);

// signer -- this holds the methods for signing
const signer = new suijs.RawSigner(keypair, provider);

// this function will return us the transaction bytes
// here we are doing a simple paySui coin to send 100000 MIST to another address
const getTransationBytes = async () => {
  const coin = "0xc7e5500000000000000000000000000000000050"
  const serializer = new suijs.RpcTxnDataSerializer("https://fullnode.devnet.sui.io:443/");
  const tr = {
    kind: "paySui",
    data: {
      inputCoins: [coin],
      recipients: ["0x6d94aeff6f16f1dc326be9865aa5ec14d2fb6f36"],
      amounts: [100000],
      gasBudget: 10000,
    },
  };
  const txb = await serializer.serializeToBytes(
    address,
    tr,
    'Commit'
  );

  return txb
}

// here we will execute our transactions
const main = async () => {

  // 1st step get the transaction bytes, this holds the address of the initiator, the method called and the inputs
  let transactionBytes = await getTransationBytes();

  // 2nd step, sign the transaction
  const {transatcionBytes, signature} = await signer.signTransaction(transactionBytes)
  // lets see the signature here which should be <flag | actual signature | public key> 
  const sigBytes = suijs.fromB64(signature);
  console.log("Signature is ", sigBytes.toString());
  // where does the public key start in the signature
  const index = sigBytes.toString().indexOf(publicKeyArray.toString());
  console.log(`Pub key is contained in sigBytes: ${publicKeyArray.toString() === sigBytes.toString().substring(index)}`);

  // 3rd step execute the transaction
  const result = await provider.executeTransaction(transactionBytes, signature, 'WaitForEffectsCert');
  console.log(JSON.stringify(result));

}

main();
