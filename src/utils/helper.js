const axios = require('axios');
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const { MAINNET_CHAIN_ID, V3_SWAP_ROUTER_ADDRESS } = require('./const')
const web3Utils = require('web3-utils')

const getRequest = async ({ url }) => {
    try {
        const response = await axios({
            url: `${url}`,
            method: 'GET',
        });
        return { response: response.data };
    } catch (error) {
        return { error: [{ name: 'server', message: `There is some issue, Please try after some time. ${error.message && error.message}`, data: error.response && error.response.data ? error.response.data : {} }] };
    }
};

const transactionBuilder = async ({
    walletAddress,
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    toQuantity,
    fromQuantity,
    slippageTolerance = 1
}) => {
    try {
        const web3Provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/5583a1ce54604375b02d6246936d9d53");

        const router = new AlphaRouter({ chainId: MAINNET_CHAIN_ID, provider: web3Provider });

        const fromToken = new Token(
            MAINNET_CHAIN_ID,
            fromContractAddress,
            fromContractDecimal
        );

        const toToken = new Token(
            MAINNET_CHAIN_ID,
            toContractAddress,
            toContractDecimal
        );

        const typedValueParsed = fromQuantity.toString()
        const fromAmount = CurrencyAmount.fromRawAmount(fromToken, typedValueParsed);

        const routeOptions = !walletAddress || walletAddress === "" ? {
            slippageTolerance: new Percent(slippageTolerance, 100),
            deadline: 100
        } : {
            recipient: walletAddress,
            slippageTolerance: new Percent(slippageTolerance, 100),
            deadline: 100
        }

        const route = await router.route(
            fromAmount,
            toToken,
            TradeType.EXACT_IN,
            {
                ...routeOptions
            }
        );

        return { route, to: V3_SWAP_ROUTER_ADDRESS, from: walletAddress };

    } catch (error) {
        throw { error }
    }

}

const rawTransaction = async ({
    walletAddress,
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    toQuantity,
    fromQuantity,
    slippageTolerance
}) => {
    try {
        const { route, to, from } = await transactionBuilder({
            walletAddress,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity,
            fromQuantity,
            slippageTolerance
        })
        const response = {
            data: route.methodParameters.calldata,
            to,
            value: web3Utils.hexToNumber(BigNumber.from(route.methodParameters.value)._hex), // value of ether to send
            // BigNumber.from(route.methodParameters.value),
            from,
            gas: web3Utils.hexToNumber(route.estimatedGasUsed._hex),
            gasPrice: web3Utils.hexToNumber(route.gasPriceWei._hex)
            // BigNumber.from(route.gasPriceWei),
        };

        return { response };
    } catch (error) {
        return { error }
    }
}

const getExchangeRate = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance = 1
}) => {
    try {
        const { route } = await transactionBuilder({
            walletAddress: null,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity: 0,
            fromQuantity,
            slippageTolerance
        })
        const response = {
            toTokenAmount: Number(route.quote.toExact()) * (10 ** toContractDecimal),
            fromTokenAmount: fromQuantity,
            estimatedGas: web3Utils.hexToNumber(route.estimatedGasUsed._hex)
        };

        return { response };
    } catch (error) {
        return { error }
    }
}

const getEstimatedGas = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance = 1
}) => {
    try {
        const { route } = await transactionBuilder({
            walletAddress: null,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity: 0,
            fromQuantity,
            slippageTolerance
        })
        const response = {
            estimatedGas: web3Utils.hexToNumber(route.estimatedGasUsed._hex)
        };

        return { response };
    } catch (error) {
        return { error }
    }
}

module.exports = { getRequest, rawTransaction, getExchangeRate, getEstimatedGas };

