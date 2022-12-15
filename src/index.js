const config = require('./config');
const helper = require('./utils/helper')
const web3Utils = require('web3-utils')
const tokenList = require('@getsafle/safle-token-lists');
const Web3 = require('web3');

class Uniswap {

    constructor(chain) {
        this.chain = chain;
    }

    async getSupportedChains() {
        return { chains: config.SUPPORTED_CHAINS };
    }

    async getSupportedTokens() {
        const tokens = await tokenList.getTokensUniswap(this.chain);
        return tokens;
    }

    async getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance }) {
        try {
            const url = helper.getBaseURL(this.chain);
            if (url.error) {
                throw helper.setErrorResponse(url.error)
            }
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const { response } = await helper.getExchangeRate(
                {
                    toContractAddress: _toContractAddress,
                    toContractDecimal,
                    fromContractAddress: _fromContractAddress,
                    fromContractDecimal,
                    fromQuantity,
                    slippageTolerance
                }, url);
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async getEstimatedGas({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance }) {
        try {
            const url = helper.getBaseURL(this.chain);
            if (url.error) {
                throw helper.setErrorResponse(url.error)
            }
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const { response } = await helper.getEstimatedGas({
                toContractAddress: _toContractAddress,
                toContractDecimal,
                fromContractAddress: _fromContractAddress,
                fromContractDecimal,
                fromQuantity,
                slippageTolerance
            }, url);
            return { estimatedGas: response.estimatedGas };
        } catch (error) {
            throw helper.setErrorResponse(error)
        }

    }

    async getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance }) {
        try {
            const url = helper.getBaseURL(this.chain);

            if (url.error) {
                throw helper.setErrorResponse(url.error)
            }
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.rawTransaction(
                {
                    walletAddress: _walletAddress,
                    toContractAddress: _toContractAddress,
                    toContractDecimal,
                    fromContractAddress: _fromContractAddress,
                    fromContractDecimal,
                    toQuantity,
                    fromQuantity,
                    slippageTolerance
                },
                url
            );

            const web3 = new Web3(new Web3.providers.HttpProvider(url.RPC));

            const gasData = await helper.getGasParams(url.GAS_API, this.chain);

            const rawTransaction = {
                to: response.to,
                from: response.from,
                data: response.data,
                value: Web3.utils.numberToHex(response.value),
                gasLimit: response.gas,
                maxFeePerGas: Web3.utils.numberToHex(Web3.utils.toWei(Number(gasData.maxFeePerGas).toFixed(4), 'gwei')),
                maxPriorityFeePerGas: Web3.utils.numberToHex(Web3.utils.toWei(Number(gasData.maxPriorityFeePerGas).toFixed(4), 'gwei')),
                nonce: await web3.eth.getTransactionCount(response.from),
                chainId: url.CHAIN_ID,
            }
            
            return rawTransaction;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async approvalRawTransaction({ fromContractAddress, walletAddress, fromQuantity }) {
        try {
            const url = helper.getBaseURL(this.chain);

            if (url.error) {
                throw helper.setErrorResponse(url.error)
            }
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.approvalRawTransaction(
                {
                    walletAddress: _walletAddress,
                    fromContractAddress: _fromContractAddress,
                    fromQuantity,
                }, 
                url
            );

            const web3 = new Web3(new Web3.providers.HttpProvider(url.RPC));

            const gasData = await helper.getGasParams(url.GAS_API, this.chain);

            let output;

            if (response !== true) {
                output = {
                    to: response.to,
                    from: response.from,
                    data: response.data,
                    value: Web3.utils.numberToHex(response.value),
                    gasLimit: response.gas,
                    maxFeePerGas: Web3.utils.numberToHex(Web3.utils.toWei(Number(gasData.maxFeePerGas).toFixed(4), 'gwei')),
                    maxPriorityFeePerGas: Web3.utils.numberToHex(Web3.utils.toWei(Number(gasData.maxPriorityFeePerGas).toFixed(4), 'gwei')),
                    nonce: await web3.eth.getTransactionCount(response.from),
                    chainId: url.CHAIN_ID,
                }
            } else {
                output = response
            }
            
            return output;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }
}

module.exports = Uniswap;