import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useCallback, useEffect } from 'react';
import {networks, networkData} from '../utils/config';
import { getPlatformFeeAccounts } from '@jup-ag/core';
import { PublicKey } from '@solana/web3.js';
import { useModel } from 'umi';
import './swap.css';
       /*
const connection = useConnection();
const feeAccounts = await getPlatformFeeAccounts(
    connection,
    new PublicKey('571AfEdTwMUFnGSv7dod4jYWAjTSVdf1JHmda5e7ieYF') // The platform fee account owner
);
      */

const Swap = () => {
  document.title = 'Swap all Solana tokens fast';

  const { wallet } = useWallet();
  //const connection = useConnection();
  const { network } = useModel('networkModel');

  const feeAcs = [
    {token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', key: new PublicKey('37V4ari7Jw2AEDaoeTQauMgM3dc9LFSsqx2gv4gJVBQ2')},
    {token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', key: new PublicKey('5mHQq7nKMyEpMPghJy9qpjGSVBEtTR4Di4QafJgRobwC')},
    {token: 'So11111111111111111111111111111111111111112', key: new PublicKey('J1wJttDHnptWxGfhJW3oeGa41zjMGmY7K9eJy9XNaHuY')},
  ];


   const platformFeeAndAccounts = {
      feeBps: 50,
      feeAccounts: new Map(feeAcs.map((obj) => [obj.token, obj.key]))
    }

      useEffect(() => {
        if (!wallet)
            return;
        if (network !== 'mainnet')
            return;
        window.Jupiter.init({
            mode: 'default',
            displayMode: 'integrated',
            integratedTargetId: 'integrated-terminal',
            passThroughWallet: wallet,
            endpoint: networkData.mainnet.rpc,
            onSuccess: ({txid}) => {

            },
            onSwapError: ({txid}) => {

            },
            platformFeeAndAccounts
        });
      }, [wallet, network]);

  return (
    <div className="swap">
      <h1>Swap</h1>
      {
          (wallet && network == 'mainnet')
          ? <div className="integrated-terminal" id="integrated-terminal"></div>
          : <div className="noWallet">Please, connect wallet in mainnet.</div>
      }

    </div>
  );
};

export default Swap;
