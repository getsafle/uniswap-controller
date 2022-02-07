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

    async getRawTransaction(_walletAddress, _toContractAddress, _fromContractAddress, toQuantity, fromQuantity, slippageTolerance = 1) {
        const toContractAddress = web3Utils.toChecksumAddress(_toContractAddress)
        const fromContractAddress = web3Utils.toChecksumAddress(_fromContractAddress)
        const walletAddress = web3Utils.toChecksumAddress(_walletAddress)
        const { response, error } = await helper.rawTransaction(walletAddress, fromQuantity);
        if (error)
            throw error
        return response;
    }
}

module.exports = Uniswap;