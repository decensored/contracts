# How to handle multiple Metamask accounts

First, there are different usages of the same term "account".

- Metamask account, a browser wallet which has a secret private key and a public key, the address, for each account.
- Decensored account, is created within the decensored smart contract. The private key is stored in the local storage of the browser. 

Because the browser storage is not the securest place in the internet, we allow to connect multiple metamask accounts to the Decensored account - so assets like tokens and NFTs are stored in the secure environment and are still usable.

To connect a metamask account, you need to go through the following steps:

1. add the metamask account address to the Decensored account via the `addExternAddress` function.

2. Call the `validateExternAddress` function via your metamask account to verify that youre the owner of that metamask account.

That's it! The Decensored account is now connected to the metamask account.

![handleMetamask](./handleMetamask.drawio.svg "handleMetamask")
