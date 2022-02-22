const config = require('./config');
const helper = require('./utils/helper')

class Uniswap {   

    async getSupportedTokens() {
        const { response } = await helper.getRequest({ url: config.SUPPORTED_TOKENS_URL });
    
        return response;
    }
}

module.exports = Uniswap;