const config = require('./config');
const helper = require('./utils/helper')
const web3Utils = require('web3-utils')
const tokenList = require('@getsafle/safle-token-lists')

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
            const url = await helper.getBaseURL(this.chain);
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
            const url = await helper.getBaseURL(this.chain);
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
            const url = await helper.getBaseURL(this.chain);
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
                }, url);
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async approvalRawTransaction({ fromContractAddress, walletAddress, fromQuantity }) {
        try {
            const url = await helper.getBaseURL(this.chain);
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
                }, url);
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }
}

module.exports = Uniswap;