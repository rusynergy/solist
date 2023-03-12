import { useState, useCallback, useEffect } from 'react';
import { defaultNetwork } from '../utils/config';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {networks, networkData} from '../utils/config';
import { useWallet } from '@solana/wallet-adapter-react';
import { Metaplex, keypairIdentity, walletAdapterIdentity  } from "@metaplex-foundation/js";
import { message } from 'antd';

import api from '../services/api';

const STAKE_PROGRAM_PK = new PublicKey('Stake11111111111111111111111111111111111111');
const WALLET_OFFSET = 44;
const DATA_SIZE = 200;

export default () => {
    const [network, setNetwork] = useState(defaultNetwork);
    const [balance, setBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(0);
    const [address, setAddress] = useState(false);
    const [connection, setConnection] = useState(false);
    const [connectionNetwork, setConnectionNetwork] = useState(false);

    const [validatorsLoading, setValidatorsLoading] = useState(false);
    const [validators, setValidators] = useState([]);

    const [oneValidator, setOneValidator] = useState({});
    const [oneValidatorLoading, setOneValidatorLoading] = useState(false);

    const [mintLoading, setMintLoading] = useState(false);

    const [candy, setCandy] = useState(false);
    const [candyLoading, setCandyLoading] = useState(false);

    const [stakes, setStakes] = useState([]);
    const [stakesLoading, setStakesLoading] = useState(false);

    const [epoch, setEpoch] = useState(0);
    const [epochLoading, setEpochLoading] = useState(false);




    //nfts
    const [ tmpnfts, setTmpnfts ] = useState([]); // pre
    const [ nfts, setNfts ] = useState([]);    // finished
    const [ nftsLoading, setNftsLoading] = useState({});

    const getConnection = useCallback((value) => {
      //  if (!connection || connectionNetwork !== network) {
           const connection = new Connection(networkData[network].rpc, "confirmed");
           setConnection(connection);
        //}
        return connection;
    }, []);

    const getBalance = (value) => {
        if (!address)
            return console.log('getBalance: no wallet');
        setBalanceLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");
        const getUserSOLBalance = async (publicKey: PublicKey, connection: Connection) => {
            let x = await connection.getBalance(address);
            setBalance((x / LAMPORTS_PER_SOL).toFixed(2));
            setBalanceLoading(false);
        };
        getUserSOLBalance(value, connection);
    };

    const getEpochInfo = () => {
        setEpochLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");
        const getEpochInfo = async (connection: Connection) => {
            let x = await connection.getEpochInfo();
            console.log('epoch info', x);
            setEpoch(x);
            setEpochLoading(false);
        };
        getEpochInfo(connection);
    };


    const getStakes = () => {
        if (!address)
            return console.log('getStakes: no wallet');
        setStakesLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");

        connection.getParsedProgramAccounts(
            STAKE_PROGRAM_PK, {
            filters: [
                {
                    dataSize: DATA_SIZE, // number of bytes
                },
                {
                memcmp: {
                    offset: WALLET_OFFSET, // number of bytes
                    bytes: new PublicKey(address), // base58 encoded string
                },
                },
            ]
        }).then(result => {
            console.log('stakes', result);
            setStakes(result);
            setStakesLoading(false);
        });
    };


    const getNfts = (value) => {
        if (!address)
            return console.log('getNfts: no wallet');
        setNftsLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");
        const metaplex = new Metaplex(connection);

        const loadData = async (nfts) => {
            const promises = nfts.map((metadata) => metaplex.nfts().load({ metadata }));
            return Promise.all(promises);
        };

        metaplex.nfts().findAllByOwner({ owner: new PublicKey(address)}).then(result => {
            setTmpnfts(result);
            loadData(result).then(loaded => {
                 setNfts(loaded);
                 setNftsLoading(false);
            //     console.log('loaded', loaded);
            });
        //    console.log('result', result);
        });
    };

    const getValidators = (value) => {
        setValidatorsLoading(true);
        try
        {
            api.validators({chain: network, short: true}).then(result => {
                console.log('loaded validators');
                if (!result.success || !result.data.result)
                    return console.log('api loading error');
                setValidators(result.data.list);
                setValidatorsLoading(false);
            });
        } catch (e)
        {
            console.log('request error', e);
        }
    }

    const getValidator = (value) => {
        if (oneValidator.pubkey == value)
            return;
        setOneValidatorLoading(true);
        try
        {
            api.one({id: value}).then(result => {
                if (!result.success || !result.data.result)
                    return console.log('api error');
                setOneValidator(result.data.data);
                setOneValidatorLoading(false);
              //
            });

        } catch (e)
        {
            console.log('request error', e);
        }
    }

    const getCandyMachine = (contract, wallet) => {
        setCandyLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");
        const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet));
        metaplex.candyMachinesV2().findByAddress({ address: new PublicKey(contract) }).then(result => {
            console.log(result);

            setCandy(result);
            setCandyLoading(false);
        });
    }

     const mintNFT = (contract, wallet) => {
        if (!address)
            return console.log('mintNFT: no wallet');
        console.log('mint with ' + network);
        setMintLoading(true);
        const connection = new Connection(networkData[network].rpc, "confirmed");
        const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet));

        let cd = false;
        try
        {
            metaplex.candyMachinesV2().findByAddress({ address: new PublicKey(contract) }).then(result => {
                console.log('candyMachine', result.price.toString());
                if (balance < (result.price.basisPoints / LAMPORTS_PER_SOL))
                    return message.error('Insufficient balance');
                try
                {
                    metaplex.candyMachinesV2().mint({
                        candyMachine: result,
                        collectionUpdateAuthority: result.authorityAddress,

                    }).then(result => {
                        getBalance(wallet.publicKey.toString());
                        getNfts(wallet.publicKey.toString());
                        setMintLoading(false);
                    });
                } catch (e)
                {
                     return message.error(e.message || 'Mint Error');
                }

            });
        } catch (e)
        {
            return message.error(e.message || 'CandyMachine Error');
        }


    }


    const changeNetwork = (value) => {
        setNetwork(value);
    };

    useEffect(() => {
        getBalance();
    }, [network, address]);

    /*useEffect(() => {
        if (validatorsLoading == true)
            getValidators();
    }, [validatorsLoading]);        */

    return {
        network,
        changeNetwork,

        balance,
        address,
        setAddress,

        balanceLoading,
        getBalance,

        validators,
        validatorsLoading,
        getValidators,

        oneValidator,
        setOneValidator,
        oneValidatorLoading,
        getValidator,

        nfts,
        nftsLoading,
        getNfts,

        getCandyMachine,
        candyLoading,
        candy,
        mintLoading,
        mintNFT,

        stakes,
        getStakes,
        stakesLoading,

        getEpochInfo,
        epoch,
        epochLoading,
    };
};



     /*
export default {
    state: {
        id: 'testnet',
    },

    effects: {
        *queryUser({ payload }, { call, put }) {
            const { data } = yield call(queryUser, payload);
            yield put({ type: 'queryUserSuccess', payload: data });
        },
    },

    reducers: {
        queryUserSuccess(state, { payload }) {
            return {
                ...state,
                user: payload,
            };
        },
    },

    test(state) {
        console.log('test');
        return state;
    },
};        */