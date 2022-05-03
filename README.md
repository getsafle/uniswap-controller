# uniswap-dex-controller

This repo contains uniswap dex controller for safle swap.

### Get supported tokens

```
await getSupportedTokens()
```

This will give us the list of all tokens supported in uniswap.

### Get Exchange Rate

```
await getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance })
```

This will give us the exchange rate of 2 tokens.<br/>
Amount of `toContractAddress` the user will receive for `quantity` of `fromContractAddress`.

### Get Estimated gas

```
await getEstimatedGas({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance })
```

This will give us the estimated amount of gas in BigNumber for the swap.

### Get Raw Transaction

```
await getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance })
```

This will give us the raw transaction to swap the tokens on uniswap.
