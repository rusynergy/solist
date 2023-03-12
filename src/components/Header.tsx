import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";

import { Link, Outlet } from 'umi';
import { useState, useEffect, useCallback } from 'react';

import './Header.css';

import {networks, networkData} from '../utils/config';
import { Select, notification, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { useModel } from 'umi';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function Header() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [loadingAirdrop, setLoadingAirdrop] = useState(false);
    const wallet = useWallet();
    const { network, changeNetwork,  balance, address, setAddress, balanceLoading, getBalance } = useModel('networkModel');
    const [api, contextHolder] = notification.useNotification();



    const getUserSOLBalance = async (publicKey: PublicKey, connection: Connection) => {
        setLoadingBalance(true);
        let x = 0;
        try
        {
            x = await connection.getBalance(publicKey);
        } catch (e)
        {
            notification.error({
               message: 'Connection error',
               description: e.message,
               placement: 'bottomRight',
            });
        }
        if (!x && balance)
            setBalance(x / LAMPORTS_PER_SOL);
       // console.log('balance', 1);
        setLoadingBalance(false);
    };

    const getAirdrop = useCallback(async () => {
        let signature: TransactionSignature | undefined = undefined;
        try {
            if (!publicKey)
                throw new Error('Wallet not connected!');
            notification.info({
                message: 'Airdrop starting',
                placement: 'bottomRight',
                key: 'airdrop',
                duration: 0,
            });

            signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
          //  console.log('Airdrop requested:', signature);
            notification.info({
                message: 'Airdrop requested',
                placement: 'bottomRight',
                key: 'airdrop',
                duration: 0,
            });

            await connection.confirmTransaction(signature, 'processed');
          //  console.log('Airdrop successful!', signature);
            notification.success({
                message: '1 SOL airdropped!',
                placement: 'bottomRight',
                key: 'airdrop',
                duration: 10,
            });

            getBalance();
        } catch (error: any) {
         //   console.log(`Airdrop failed! ${error?.message}`, signature);
            notification.error({
                message: 'Airdrop error',
                description: error?.message,
                placement: 'bottomRight',
                key: 'airdrop',
                duration: 30,
            });
        }
    }, [publicKey, connection]);


    useEffect(() => {
        setAddress(wallet.publicKey);
      }, [wallet.publicKey]);

    return (
        <header className="flex-wrap">
            <div className="left flex">
                <Link to="/">
                    <img src="https://solist.app/favicon.svg?2023" alt="Solist Logo" />
                </Link>
                <div className="menu">    
                    <Link to="/stake">Stake</Link>
                    <Link to="/swap">Swap</Link>       
                    <Link to="/nft">NFT</Link>
                    <Link to="/validators">Nodes</Link>
                    {(network !== 'mainnet') && (<a href="#" onClick={getAirdrop}>Airdrop</a>)}
                </div>
            </div>

            <div className="wallet flex">
                {(publicKey) && (balanceLoading ? <Spin indicator={antIcon} /> : <div className="balance">{balance || 0} SOL</div>)}
                <div className="selectNetwork">
                    <Select
                        value={network}
                        style={{width:'150px'}}
                        onChange={(e) => {
                            changeNetwork(e, publicKey);
                        }}
                    >
                        {networks.map(key => <Select.Option key={key}>{networkData[key].name}</Select.Option>)}
                    </Select>
                </div>
                <WalletMultiButton />
            </div>
        </header>
    );
}
