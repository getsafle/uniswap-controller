const axios = require('axios');
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { Token, CurrencyAmount, TradeType, Percent, Ether } = require('@uniswap/sdk-core')
const { ethers, BigNumber, Contract } = require('ethers')
const { MAINNET_CHAIN_ID, V3_SWAP_ROUTER_ADDRESS, ETHEREUM_ADDRESS, INFURA_RPC, ERROR_MESSAGES: { NULL_ROUTE, INVARIANT_ADDRESS, QUOTE_OF_NULL, TOKEN_PAIR_DOESNOT_EXIST, INSUFFICIENT_BALANCE } } = require('./const')
const web3Utils = require('web3-utils')
const { TOKEN_CONTRACT_ABI } = require('./tokenABI')

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
}) => {
    try {
        const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);

        const router = new AlphaRouter({ chainId: MAINNET_CHAIN_ID, provider: web3Provider });

        let fromToken;
        if (fromContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || fromContractAddress.toLowerCase() === 'eth'.toLowerCase()) {
            fromToken = new Ether(MAINNET_CHAIN_ID)
        }
        else {
            fromToken = new Token(
                MAINNET_CHAIN_ID,
                fromContractAddress,
                fromContractDecimal
            );
        }

        let toToken;
        if (toContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || toContractAddress.toLowerCase() === 'eth'.toLowerCase()) {
            toToken = new Ether(MAINNET_CHAIN_ID)
        }
        else {
            toToken = new Token(
                MAINNET_CHAIN_ID,
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
}) => {
    try {
        await checkBalance(fromContractAddress, walletAddress, fromQuantity)
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
        case INSUFFICIENT_BALANCE:
            return { err, message: INSUFFICIENT_BALANCE }
        default:
            return { err, message: err.message }
    }
}

const checkBalance = async (fromContractAddress, walletAddress, fromQuantity) => {
    try {
        let tokenBalance;
        const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);
        if (fromContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || fromContractAddress.toLowerCase() === 'eth'.toLowerCase()) {
            tokenBalance = await web3Provider.getBalance(walletAddress)
        } else {
            const contract = new Contract(fromContractAddress, TOKEN_CONTRACT_ABI, web3Provider);
            tokenBalance = await contract.balanceOf(walletAddress);
        }

        if (Number(tokenBalance) < fromQuantity)
            throw new Error(INSUFFICIENT_BALANCE)
        else
            return true
    } catch (err) {
        throw err
    }
}

const approvalRawTransaction = async ({
    fromContractAddress, walletAddress, fromQuantity
}) => {
    try {
        await checkBalance(fromContractAddress, walletAddress, fromQuantity)
        if (fromContractAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || fromContractAddress.toLowerCase() === 'eth'.toLowerCase())
            return { response: true }
        else {

            const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);
            const contract = new Contract(fromContractAddress, TOKEN_CONTRACT_ABI, web3Provider);
            const checkAllowance = await contract.allowance(walletAddress, V3_SWAP_ROUTER_ADDRESS);

            if (Number(checkAllowance) < fromQuantity) {
                const txCount = await web3Provider.getTransactionCount(walletAddress);
                // build the transaction
                const tx = {
                    from: walletAddress,
                    nonce: ethers.utils.hexlify(txCount),
                    to: fromContractAddress,
                    data: contract.interface.encodeFunctionData('approve', [V3_SWAP_ROUTER_ADDRESS, fromQuantity]),
                    gas: await contract.estimateGas.approve(V3_SWAP_ROUTER_ADDRESS, fromQuantity),
                    gasPrice: await web3Provider.getGasPrice(),
                };
                return { response: tx }
            }
            else
                return { response: true }
        }
    } catch (err) {
        throw err
    }
}

module.exports = { getRequest, rawTransaction, getExchangeRate, getEstimatedGas, setErrorResponse, approvalRawTransaction };

