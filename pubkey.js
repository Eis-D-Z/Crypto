// imports
const suijs = require("@mysten/sui.js");

// private key
const privKey = [
  64, 33, 18, 129, 136, 164, 29, 72, 239, 96, 52, 154, 150, 171, 75, 60, 77, 41,
  39, 97, 102, 68, 153, 22, 250, 49, 38, 5, 66, 251, 14, 128,
];

console.log(`The length of our private key is: ${privKey.length} bytes`);

// Under the hood we use the tweetnacl library for ED25519 stuff
// Check out their code, if you want to see what's actually happening
const getPublicKey = () => {
  const keypair = suijs.Ed25519Keypair.fromSecretKey(Uint8Array.from(privKey));
  const publicKey = keypair.getPublicKey().toBytes();
  const publicKeyArray = Array.from(publicKey);
  return publicKeyArray;
};

const pubKey = getPublicKey();
console.log(`The corresponding public key to the \n${privKey} \nprivate key is:\n${pubKey}`);
