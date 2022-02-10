const config = require('./config');
const helper = require('./utils/helper')
const web3Utils = require('web3-utils')

class Uniswap {

    async getSupportedTokens() {
        const { response, error } = await helper.getRequest({ url: config.SUPPORTED_TOKENS_URL });
        if (error)
            throw error
        return response;
    }

    async getExchangeRate(_toToken, _fromToken, quantity) {
        const toToken = web3Utils.toChecksumAddress(_toToken)
        const fromToken = web3Utils.toChecksumAddress(_fromToken)
        const { response, error } = await helper.getExchangeRate(quantity);
        if (error)
            throw error
        return response;
    }

    async getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance = 1 }) {
        const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
        const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
        const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
        const { response, error } = await helper.rawTransaction(
            {
                walletAddress: _walletAddress,
                toContractAddress: _toContractAddress,
                toContractDecimal,
                fromContractAddress: _fromContractAddress,
                fromContractDecimal,
                toQuantity,
                fromQuantity,
                slippageTolerance
            });
        if (error)
            throw error
        return response;
    }
}

module.exports = Uniswap;