# uniswap-dex-controller

This SDK houses the functions to interact with the Uniswap Contracts.

## Installation

To install this SDK,

```sh
npm install --save @getsafle/uniswap-controller
```

## Initialization

Initialize the constructor,

```js
const UniSwap = require('@getsafle/uniswap-controller');

const controller = new UniSwap(chain);
```

<br>

> Get supported tokens

This function will give us the list of all tokens supported by Uniswap.

```js
await controller.getSupportedTokens()
```

<br>

> Get supported chains

This function will give us the list of all supported chains.

```js
await controller.getSupportedChains()
```

<br>

> Get Exchange Rate

<br>

This will give us the exchange rate of 2 tokens.
Amount of `fromContractAddress` the user will receive for `fromQuantity` of `toContractAddress`.

```js
await controller.getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance })
```

<br>

> Get Estimated gas

<br>

This will give us the estimated amount of gas needed to do the swap.

```js
await controller.getEstimatedGas({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance })
```

<br>

> Get Raw Transaction

<br>

This will give us the raw transaction to swap the tokens on 1inch.

```js
await controller.getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance })
```

<br>

> Get Approval Transaction

<br>

This function will call the approval smart contract function to approve spending `fromQuantity` for the `fromContractAddress` from the `walletAddress`.

```js
await controller.approvalRawTransaction({ fromContractAddress, walletAddress, fromQuantity })
```
