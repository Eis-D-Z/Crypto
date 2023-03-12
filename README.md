# Sui key pairs

## Intro

Cryptography is the science of secure communication between different parties. It involves the use of cryptographic functions that accept a message and a key as input and output a ciphertext. The ciphertext is unreadable without the correct key.

Cryptography involves two actions: **encryption** and **decryption**.

Alice wants to send Bob a message. By using cryptography, we keep the message secret from anyone else who might intercept it. Alice uses a secret key to encrypt the message "Hello" and then the key and the encrypted message are sent to Bob.

Bob receives the encrypted message and the key from Alice. After using the key to decrypt the message, he can see that Alice sent him the message "Hello".

In this example, encryption takes place when Alice uses her secret key to convert the message into a secret code. Decryption takes place when Bob receives the encrypted message and uses the same key to decode it and read the original message.

To maintain the security of the message and the key, they must be kept secret. Symmetric key cryptography and asymmetric key cryptography are the two primary types of cryptographic solutions.

- **Symmetric key cryptography** uses the same key to encrypt and decrypt the message. However, securely exchanging the key between the parties is a concern.

- **Asymmetric key cryptography** uses a key pair consisting of a public key and a private key. The public key is used for encryption, while the private key is used for decryption. However, for each communication pathway, a new key pair is required, and securely distributing the public keys is a challenge. The private key must also be kept secure to prevent unauthorized decryption.

## Sui

Sui, and blockchains, are built upon the second solution of cryptography, the key pair. Every member of Sui has (at least one) a key pair, the public keys are known to everyone, while each private key is known by a single member. Communication is possible between any pair of members.

A big feature of key pair cryptography is that an owner of a private key may "sign" a message with that key and all members can verify using the known public key that the message was indeed signed by that private key and no other. This is similar to real life signatures, depending on the context it may mean different things, usually either acknowledgement or agreement with the message, or proof of origin. For example, if I have a private key, I can sign the message "千金博美人一笑" with my private key, this is the equivalent of having the message on paper and me writing my signature below. When "signing" a message the message remains readable and just some additional data are added, the "signature".

This feature is heavily used by all blockchains, when I want to initiate a transaction, that is alter the state of the chain, I have to sign the transaction and prove myself as the initiator. As long as the private key is securely known only by myself, all transactions signed with my private key must have been done by me.

Thus on Sui, any transaction, has to be signed, in order to prove the initiator. On Sui if I want to spend Bob's SUI coins, it won't work, because Bob's coins need Bob's private key signature, using my private key's signature will fail.

Every transaction, has to go through two steps, that are usually combined into one by sdk's.  

1) The transaction kind (moveCall, paySui or any other native function that the VM understands), the inputs and the signer (the address of initiator of the transaction) must be serialized and turned into bytecode and encoded in base64 (soon base58) called the `transaction bytes`. This step should be done by the user, sdk's usually do this under the hood.

2) The same signer, as the one provided above, must sign the transaction bytes with their private key in order to confirm their intent, and call the `executeTransaction` method of Sui. At this point the changes entailed by the transaction will be applied on the state and a finality certicate will be returned, this means that the transaction took place on Sui.

Many builders, though, still want to build the transaction (get the transaction bytes) first and execute at a later point in time. Especially exchanges and DeFi's.

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
My best attempt at offline signing can be found at offline_signing.js.

Key points:

- The signing mechanism is heavily used by Sui both in consensus where validators sign their messages and in user -> ledger interaction where the user sings his messages (transactions)
- The signing process is used to guarantee and determine the origin of the message, thus Alice, after transfering SUI to Bob, cannot claim that it was not her intention, since she has signed the transaction using the private key only known to her and we can determine that using her public key which is known to all (and was provided during the transaction)
- For different reasons the process is, Alice first provided the transaction details along with her address, then she signed the transaction bytes and provided her public key, lastly the transaction was finalized if the address trully coresponded to the provided public key and the transaction was proved that it was signed using the correct private key.

This is the method through which Sui can prove its state is the correct one and all transactions were originated by the respective users.
