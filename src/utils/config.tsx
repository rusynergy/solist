module.exports = {

    apiPrefix: '/api',
    build: 20,
    defaultNetwork: 'mainnet',
    networks: [
        'mainnet',
        'testnet',
        'devnet',
    ],
    dva: {},
    networkData: {
        mainnet: {
            rpc: 'https://proud-intensive-pine.solana-mainnet.discover.quiknode.pro/74346c4c78b0303291ca6d81f5bb3ab1a4f9109c/',
            name: 'Mainnet Beta',
            explorerTransaction: 'https://solscan.io/tx/{id}',
            explorerAccount: 'https://solscan.io/account/{id}',
            ourVote: 'ANRnEc3NFWyDFkJNHPnts9XAT1odt931qbgzMsSGdE1z',
        },
        testnet: {
            rpc: 'https://api.testnet.solana.com',
            name: 'Testnet',
            explorerTransaction: 'https://solscan.io/tx/{id}?cluster=testnet',
            explorerAccount: 'https://solscan.io/account/{id}?cluster=testnet',
            ourVote: '7X76BZPnX9dX7uyEijs2NVuok6HRR27Gx7q8yNKNFm1R',
        },
        devnet: {
            rpc: 'https://api.devnet.solana.com',
            name: 'Devnet',
            explorerTransaction: 'https://solscan.io/tx/{id}?cluster=devnet',
            explorerAccount: 'https://solscan.io/account/{id}?cluster=devnet',
            nftContract: '4unvBfpWKYw7ovpHDgG36R9AfTM5uTV2CuYmtfEuHhV6',
        },
    },

};