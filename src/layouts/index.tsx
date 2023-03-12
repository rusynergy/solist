import { Link, Outlet } from 'umi';
import styles from './index.less';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletDialogProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
/*
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter, GlowWalletAdapter, BraveWalletAdapter, WalletConnectWalletAdapter, LedgerWalletAdapter } from '@solana/wallet-adapter-wallets'; */

import { clusterApiUrl } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

import Header from '../components/Header';
import Footer from '../components/Footer';

import { ConfigProvider, theme } from 'antd';
import { useModel } from 'umi';
import {networks, networkData} from '../utils/config';


const Context: FC<{ children: ReactNode }> = ({ children }) => {
    const { network } = useModel('networkModel');
    const endpoint = useMemo(() => networkData[network].rpc, [networkData[network].rpc]);
    const wallets = useMemo(
        () => [
          /*  new PhantomWalletAdapter(),
            new WalletConnectWalletAdapter(),
            new SolflareWalletAdapter(),
            new TrustWalletAdapter(),
            new GlowWalletAdapter(),
            new BraveWalletAdapter(),
            new LedgerWalletAdapter(), */
           // new UnsafeBurnerWalletAdapter(),
        ],
        [networkData[network].rpc]
    );


    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
                wallets={wallets}
                autoConnect
            >
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default function Layout() {
  return (
            <Context>
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                    }}
                >
                <Header />
                <div className="content">
                    <Outlet />
                </div>
                <Footer />
                </ConfigProvider>
            </Context>
  );
}

