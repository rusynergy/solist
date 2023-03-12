import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { HeatMapOutlined, HeartOutlined, CloudServerOutlined } from '@ant-design/icons';

import { Link } from 'umi';
import './index.css';

export default function HomePage() {
    const { publicKey } = useWallet();
    document.title = 'Solist — stake solana, nft tool, validator info';
    return (
        <div>
            <h1>Welcome to Solist.</h1>
            <p>Solist &mdash; simple stake & nft tool for Solana blockchain.</p>
            <div className="main flex-wrap">
                <Link to="/stake">
                    <HeatMapOutlined />
                    <div className="more">
                        <h2>Stake your Solana</h2>
                        <p>Decentralized stake tool for SOL</p>
                    </div>
                </Link>
                <Link to="/nft">
                    <HeartOutlined />
                    <div className="more">
                        <h2>View your NFTs</h2>
                        <p>Simple your NFT viewer</p>
                    </div>
                </Link>
                <Link to="/validators">
                    <CloudServerOutlined />
                    <div className="more">
                        <h2>Validators</h2>
                        <p>List of solana validators with extra information</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
