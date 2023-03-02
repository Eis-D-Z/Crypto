const sha3 = require("sha3");

/* 
    Assuming we have a public key, an array of 32 bytes, we will derive the address that corresponds to this public key.
*/
// initial address for testing purposes
initialAddress = "0xa38bc2aa63c34e37821f7abb34dbbe97b7ab2ea2";
console.log(
  `This is our initial address as outputted by sui client active-address: ${initialAddress}`
);

// 32 bytes array, we got this from the pubkey.js
const publicKeyArray = [
  98, 83, 175, 119, 149, 218, 4, 236, 112, 227, 24, 192, 205, 26, 178, 52, 179,
  39, 31, 72, 2, 16, 223, 13, 82, 197, 48, 195, 115, 45, 29, 139,
];
console.log(`The length of our public key is ${publicKeyArray.length} bytes`);

// 1st step: add the 0 byte because this public key is of ED25519 scheme
publicKeyArray.unshift(0);

// 2nd step: hash the array using the SHA3-256 hash function
const hashFun = sha3.SHA3(256);
const buf = Buffer.from(publicKeyArray);
hashFun.update(buf);
const hash = hashFun.digest("hex");

// log all the hash
console.log("The resulting hash is: ", hash);

//3rd step: get the first 40 characters
let address = hash.slice(0, 40);
// and prepend the 0x
address = "0x" + address;
console.log(`The corresponding address is: ${address}`);
console.log(
  "The address we derived matches the initial address: ",
  address === initialAddress
);
