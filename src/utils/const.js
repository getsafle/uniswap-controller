module.exports = {
    V3_SWAP_ROUTER_ADDRESS: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    ETHEREUM_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ERROR_MESSAGES: {
        NULL_ROUTE: 'Route cannot be null',
        INVARIANT_ADDRESS: 'Invariant failed: ADDRESSES',
        QUOTE_OF_NULL: "Cannot read property 'quote' of null",
        INSUFFICIENT_BALANCE: "Insufficient balance.",
        TOKEN_PAIR_DOESNOT_EXIST: "Provided token pair is not supported",
        INVALID_CHAIN_ERORR: "Invalid chain selected",
    },
    NETWORK: {
        POLYGON_MAINNET: {
            NAME: 'polygon',
            RPC: 'https://rpc-mainnet.maticvigil.com',
            CHAIN_ID: 137
        },
        ETHEREUM_MAINNET: {
            NAME: 'ethereum',
            RPC: 'https://mainnet.infura.io/v3/2851f8f32e8f4476bb4b9a7b9c6e5292',
            CHAIN_ID: 1
        }
    }
}