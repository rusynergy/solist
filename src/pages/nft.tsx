import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, Connection } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';
import { networks, networkData } from '../utils/config';
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

import { LoadingOutlined } from '@ant-design/icons';
import { notification, List, Spin, Empty, Button, Modal } from "antd";

import Imager from '../components/Imager';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

import { useModel } from 'umi';

import './nft.css';

const NFTpage = () => {
    document.title = 'View your NFT on Solana and create new with Solist';
    const { publicKey } = useWallet();
    const wallet = useWallet();
    const { address, network, nfts, nftsLoading, getNfts, mintLoading, mintNFT, candyLoading, getCandyMachine, candy } = useModel('networkModel');
   // const [ nfts, setNfts ] = useState([]); // pre
    // [ els, setEls ] = useState([]);    // finished
  //  const [ nftsLoading, setNftsLoading] = useState({});

    useEffect(() => {
        if (!address)
            return console.log('NFTs no wallet');
        getNfts(address);
        if (networkData[network]?.nftContract !== undefined)
            getCandyMachine(networkData[network]?.nftContract, wallet);
    }, [address, network]);

     if (!publicKey)
        return (
            <div>
                <h1>NFT</h1>
                <p>Please, connect your wallet.</p>
            </div>
        );

    return (

        <div className="nfts">
            <h1>NFT</h1>

            {(candy && networkData[network]?.nftContract !== undefined) && (<div className="mint flex">
               <Button
                    loading={mintLoading}
                    disabled={candy.itemsRemaining.toString(10) == '0'}
                    onClick={() => {
                        mintNFT(networkData[network]?.nftContract, wallet);
                    }}>Mint NFT
                </Button>
                <div className="a">Available: {candy.itemsRemaining.toString(10)}/{candy.itemsAvailable.toString(10)}</div>
                <div className="a">Price: {(candy.price?.basisPoints / LAMPORTS_PER_SOL).toFixed(2)} SOL</div>

            </div>)}

            {nftsLoading
                ? <div className="loading">{antIcon}</div>
                : <div className="els flex">
                    {nfts.length == 0
                        ? <Empty description="No NFTs found" />
                        : nfts.map((item, index) => {
                            return <div className="e" key={index}>
                                        <div className="image">
                                            <Imager
                                                alt={item?.json?.name}
                                                src={item?.json?.image || 'https://solist.app/images/NFT.jpg'}
                                            />
                                        </div>
                                       <div className="name">{item.name}</div>
                                </div>;
                            })
                    }
                </div>
            }
        </div>
    );
};

export default NFTpage;
