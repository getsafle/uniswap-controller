const axios = require('axios');
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { Token, CurrencyAmount, TradeType, Percent, Ether } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const { NETWORK, V3_SWAP_ROUTER_ADDRESS, ETHEREUM_ADDRESS, ERROR_MESSAGES: { NULL_ROUTE, INVARIANT_ADDRESS, QUOTE_OF_NULL, TOKEN_PAIR_DOESNOT_EXIST, INVALID_CHAIN_ERORR } } = require('./const')
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
    slippageTolerance
}, network) => {
    try {
        const web3Provider = new ethers.providers.JsonRpcProvider(network.RPC);

        const router = new AlphaRouter({ chainId: network.CHAIN_ID, provider: web3Provider });

        let fromToken;
        if (fromContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || fromContractAddress.toLowerCase() === 'eth'.toLowerCase()) {
            fromToken = new Ether(network.CHAIN_ID).wrapped
        }
        else {
            fromToken = new Token(
                network.CHAIN_ID,
                fromContractAddress,
                fromContractDecimal
            );
        }

        let toToken;
        if (toContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || toContractAddress.toLowerCase() === 'eth'.toLowerCase()) {
            toToken = new Ether(network.CHAIN_ID).wrapped

        }
        else {
            toToken = new Token(
                network.CHAIN_ID,
                toContractAddress,
                toContractDecimal
            );
        }

        const typedValueParsed = fromQuantity.toString()
        const fromAmount = CurrencyAmount.fromRawAmount(fromToken, typedValueParsed);

        const routeOptions = !walletAddress || walletAddress === "" ? {
            slippageTolerance: new Percent(slippageTolerance, 100),
            deadline: Date.now() + 3600000
        } : {
            recipient: walletAddress,
            slippageTolerance: new Percent(slippageTolerance, 100),
            deadline: Date.now() + 3600000
        }

        const route = await router.route(
            fromAmount,
            toToken,
            TradeType.EXACT_INPUT,
            {
                ...routeOptions
            }
        );

        return { route, to: V3_SWAP_ROUTER_ADDRESS, from: walletAddress };

    } catch (error) {
        throw error
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
}, network) => {
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
        }, network)
        if (!route)
            throw new Error(NULL_ROUTE)
        const response = {
            data: route.methodParameters.calldata,
            to,
            value: (web3Utils.hexToNumber(BigNumber.from(route.methodParameters.value)._hex)).toString(), // value of ether to send
            from,
            gas: web3Utils.hexToNumber((route.estimatedGasUsed.mul(10))._hex),
            gasPrice: (web3Utils.hexToNumber(route.gasPriceWei._hex)).toString()
        };

        return { response };
    } catch (error) {
        throw error
    }
}

const getExchangeRate = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance
}, network) => {
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
        }, network)
        if (!route)
            throw new Error(NULL_ROUTE)
        const response = {
            toTokenAmount: (Number(route.quote.toExact()) * (10 ** toContractDecimal)).toString(),
            fromTokenAmount: fromQuantity.toString(),
            estimatedGas: web3Utils.hexToNumber(route.estimatedGasUsed._hex)
        };

        return { response };
    } catch (error) {
        throw error
    }
}

const getEstimatedGas = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance
}, network) => {
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
        }, network)
        if (!route)
            throw new Error(NULL_ROUTE)
        const response = {
            estimatedGas: web3Utils.hexToNumber(route.estimatedGasUsed._hex)
        };

        return { response };
    } catch (error) {
        throw error
    }
}

const setErrorResponse = (err) => {
    switch (err.message) {
        case INVARIANT_ADDRESS:
        case QUOTE_OF_NULL:
        case NULL_ROUTE:
            return { err, message: TOKEN_PAIR_DOESNOT_EXIST }
        default:
            return { err, message: err.message }
    }
}

const getBaseURL = async (chain) => {
    switch (chain) {
        case NETWORK.POLYGON_MAINNET.NAME:
            return {
                RPC: NETWORK.POLYGON_MAINNET.RPC,
                CHAIN_ID: NETWORK.POLYGON_MAINNET.CHAIN_ID
            }
        case NETWORK.ETHEREUM_MAINNET.NAME:
            return {
                RPC: NETWORK.ETHEREUM_MAINNET.RPC,
                CHAIN_ID: NETWORK.ETHEREUM_MAINNET.CHAIN_ID
            }
        default:
            return { error: { message: INVALID_CHAIN_ERORR } }
    }

}

module.exports = { getRequest, rawTransaction, getExchangeRate, getEstimatedGas, setErrorResponse, getBaseURL };

