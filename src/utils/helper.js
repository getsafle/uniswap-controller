const axios = require('axios');
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')

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

const transactionBuilder = async (_walletAddress, fromQuantity, slippageTolerance = 1) => {

    try {
        const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
        const MY_ADDRESS = _walletAddress;
        const web3Provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/5583a1ce54604375b02d6246936d9d53");

        const router = new AlphaRouter({ chainId: 1, provider: web3Provider });

        const WETH = new Token(
            1,
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            18,
            'WETH',
            'Wrapped Ether'
        );

        const USDC = new Token(
            1,
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            6,
            'USDC',
            'USD//C'
        );

        const typedValueParsed = fromQuantity.toString()
        const wethAmount = CurrencyAmount.fromRawAmount(WETH, typedValueParsed);

        const route = await router.route(
            wethAmount,
            USDC,
            TradeType.EXACT_IN,
            {
                recipient: _walletAddress,
                slippageTolerance: new Percent(slippageTolerance, 100),
                deadline: 100
            }
        );

        return { route, to: V3_SWAP_ROUTER_ADDRESS, from: MY_ADDRESS };

    } catch (error) {
        throw { error }
    }

}

const rawTransaction = async (_walletAddress, fromQuantity, slippageTolerance = 1) => {
    try {
        const { route, to, from } = await transactionBuilder(_walletAddress, fromQuantity, slippageTolerance)
        const response = {
            data: route.methodParameters.calldata,
            to,
            value: BigNumber.from(route.methodParameters.value),
            from,
            gasPrice: BigNumber.from(route.gasPriceWei),
        };

        return { response };
    } catch (error) {
        return { error }
    }
}

module.exports = { getRequest, rawTransaction };

