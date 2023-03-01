# Sui key pairs

## Intro

Cryptography in layman's terms is the science that studies secure communication between distinct parties.
Secure has implications that are out of the scope of the present.
Most often is Alice wanting to pass a message to Bob and only to him.
The way to do this is with a cryptographic function, this function accepts as input the message and a key and outputs a ciphertext, text that is illeglible, also it can accept the ciphertext and a key and output the message. One action is called encrypting, the other is called decrypting.

In this setup the message and the key are the parts that have to remain secure and secret, the ones who have the proper key can read the message, and cryptography also deals with this aspect.


Today cryptographic solutions are divided in two broad categories based on the type of keys:

- Symmetric key cryptography, that is the same key encrypts the message into ciphertext and the same key decrypts the ciphertext into plain text message, and here the concern is how Alice and Bob can exchange the key in a secure manner.

- Asymmetric key cryptography, or a key pair made of a public and a private key, the public key can only encrypt while the private key can only decrypt. In this setup, a key pair only facilitates one way communication, Alice with the public key can encrypt and Bob with the private can decrypt. The concerns are two, for every additional communication pathway another key pair is required, so a system to reliably distribute the public keys is required, and the security of the private key.

## Sui

Sui, and blockchains, are built upon the second solution of cryptography, the key pair. Every member of Sui has (at least one) a key pair, the public keys are known to everyone, while each private key is known by a single member. Communication is possible between any pair of members.

A big feature of key pair cryptography is that an owner of a private key may "sign" a message with that key and all members can verify using the known public key that the message was indeed signed by that private key and no other. This allows for proof of identity, any member can prove that a message origated from him/her-self by sign it. For example, if I have a private key, I can sign the message "千金博美人一笑" with my private key, thus prove that I am the originator of the message to people who have my public key. When "signing" a message the message remains readable and just some additional data are added, the "signature".

This feature is heavily used by all blockchains, when I want to initiate a transaction, that is alter the state of the chain, I have to sign the transaction and prove that I am indeed the initiator. As long as the private key is securely known only by myself, signing a transaction is enough to prove myself as the initiator.

Thus on Sui, any transaction, has to be signed, in order to prove the initiator. On Sui if I want to spend Bob's SUI coins, it won't work, because Bob's coins need Bob's private key signature, using my private key's signature will fail.

Every transaction, therefore, has to go through two stages on Sui.

1) The transaction kind (moveCall, paySui or any other native function that the VM understands), the inputs and the signer (the address of originator of the transaction) must be provided to validators which will return bytecode in base64 (soon base58) called the `transaction bytes`. At this point some preliminary checks have been made that everything is alright and a transaction that can be understood and executed by Sui is ready.

2) The same signer, as the one provided above, must sign the transaction bytes with their private key in order to confirm their intent, and call the `executeTransaction` method of Sui. At this point the changes entailed by the transaction will be applied on the state and a finality certicate will be returned, this means that the transaction took place on Sui.

## Public key derivation

One important point to remember is that the most critical info of a key pair is the private key. With a private key, the coresponding public key is easilly derived and after that the coresponding address. Thus in any solution we provide as a team we must take exceptional care of the security of private keys. For the ED25519 scheme (cryptographic scheme that we will focus here), both the private and the public key are 32 bytes long. In other words the private and public keys are just an array of 32 bytes.

Programmatic example of public key derivation can be found at pubkey.js

## Public Key and address

The public key, on Sui, is an array of bytes, for the ED25519 scheme, this is 32 bytes, this means a sequence of 32 numbers, each ranging from 0 to 255. We can calculate that Sui can have at most 32^255 public keys.

Because reading an array of 32 bytes is quite bothersome, addresses were invented, each public key can be represented uniquely by an address.
In Sui the address is derived as following:

- Prepend (add in front) a byte to the 32 bytes, 0 for ED25519, 1 for secp356k1 (the other cryptographic scheme supported by Sui)
- Hash the resulting byte array using the SHA256 hash
- Take the first 40 characters of the digest (output of the hash) and prepend 0x, this is going to grow these days on Sui to the first 64 characters.

In the file address.js we can see the process programmatically.

The main points to remember here are:
 - An address represents a public key, but the public key cannot be derived from the address since a hash is a one way function
 - The private key is irrelevant in this process.

## Signing

Signing is the cryptographic process through which any message can have it's originator (owner of the private key) declared and subsequently verified by using the known public key.

A programmatic example can be found at signing.js

Key points:

- The signing mechanism is heavily used by Sui both in consensus where validators sign their messages and in user -> ledger interaction where the user sings his messages (transactions)
- The signing process is used to guarantee and determine the origin of the message, thus Alice, after transfering SUI to Bob, cannot claim that it was not her intention, since she has signed the transaction using the private key only known to her and we can determine that using her public key which is known to all (and was provided during the transaction)
- For different reasons the process is, Alice first provided the transaction details along with her address, then she signed the transaction bytes and provided her public key, lastly the transaction was finalized if the address trully coresponded to the provided public key and the transaction was proved that it was signed using the correct private key.

This is the method through which Sui can prove its state is the correct one and all transactions were originated by the respective users.