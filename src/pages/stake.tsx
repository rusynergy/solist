import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, Connection, Transaction, StakeProgram, sendAndConfirmTransaction, Keypair, Lockup, Authorized  } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';
import { networks, networkData } from '../utils/config';
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

import { LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { notification, List, Spin, Empty, Button, Avatar, Modal, Select, Space, Drawer, InputNumber, Form, Alert } from "antd";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
import Copier from '../components/Copier';


import { Link } from 'umi';
import { useModel } from 'umi';

import './stake.css';

const Stake = () => {
    document.title = 'Stake your SOL with Solist';
    const { publicKey } = useWallet();
    const wallet = useWallet();
    const { address, network, balance, getStakes, stakes, stakesLoading, getValidators, validators, epoch, getEpochInfo, epochLoading, getBalance } = useModel('networkModel');
    const [ vote, setVote ] = useState();
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ modalStake, setModalStake ] = useState(false);

    const [ newOpen, setNewOpen ] = useState(false);

    const [ selectedValidator, setSelectedValidator ] = useState([]);
    const [ newLamports, setNewLamports ] = useState(2);

    useEffect(() => {
        if (!address)
            return console.log('Stakes: no wallet');
        getStakes(address);
        getValidators();
        getEpochInfo();
    }, [address, network]);

     if (!publicKey)
        return (
            <div>
                <h1>Your stakes</h1>
                <p>Please, connect your wallet.</p>
            </div>
        );

     let buttons = {
        'off':   (item) => <Button
                                key="off"
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Do you really want deactivate this stake?',
                                        content: 'This active will make stake inactive from next epoch. It will be possible to withdraw funds in the next epoch.',
                                        onOk: () => {
                                            notification.open({
                                                placement: 'bottomRight',
                                                key: item.pubkey.toString(),
                                                icon: antIcon,
                                                message: 'Deactivation started...',
                                                description: 'stake account ' + item.pubkey.toString(),
                                                duration: 0,
                                            });

                                            let connection = new Connection(networkData[network].rpc, "confirmed");

                                          //  console.log('wallet' , wallet);
                                        //    console.log('deactivate', item.pubkey.toString());

                                            connection.getLatestBlockhashAndContext().then(data => {
                                                const transaction = new Transaction({
                                                    blockhash: data.blockhash,
                                                    feePayer: wallet.publicKey,
                                                 //   lastValidBlockHeight: data.lastValidBlockHeight,
                                                }).add(
                                                    StakeProgram.deactivate({
                                                        stakePubkey: item.pubkey,
                                                        authorizedPubkey: wallet.publicKey,
                                                    }),
                                                );

                                                wallet.sendTransaction(transaction, connection, { minContextSlot: data.minContextSlot }).then(signature => {
                                                    notification.open({
                                                        placement: 'bottomRight',
                                                        key: item.pubkey.toString(),
                                                        icon: antIcon,
                                                        message: 'Deactivation sended...',
                                                        description: 'stake account ' + item.pubkey.toString(),
                                                        duration: 0,
                                                    });

                                                    connection.confirmTransaction({
                                                        blockhash: data.blockhash,
                                                //        lastValidBlockHeight:data.lastValidBlockHeight,
                                                        signature
                                                    }).then(success => {
                                                        notification.success({
                                                            placement: 'bottomRight',
                                                            key: item.pubkey.toString(),
                                                            message: 'Deactivation success!',
                                                            description: 'stake account ' + item.pubkey.toString(),
                                                            duration: 15,
                                                        });
                                                        setTimeout(getStakes(), 3000);
                                                    });
                                                });

                                            });

                                        }
                                    });
                                }}
                              >Deactivate</Button>,
        'split': (item) => <Button
                                key="split"
                            >Split</Button>,
        'delegate': (item) => <Button
                                key="delegate"
                                onClick={() => {
                                    if (item.account?.data?.parsed?.info?.stake?.delegation?.voter)
                                    {
                                        console.log('setVote', item.account?.data?.parsed?.info?.stake?.delegation?.voter);
                                        setVote(item.account?.data?.parsed?.info?.stake?.delegation?.voter);
                                    }
                                   setModalStake(item);
                                   setModalOpen(true);
                                }}
                              >Delegate</Button>,
        'withdraw': (item) => <Button
                                key="withdraw"
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Do you really want withdraw this stake?',
                                        content: '',
                                        onOk: () => {
                                            notification.open({
                                                placement: 'bottomRight',
                                                key: item.pubkey.toString(),
                                                icon: antIcon,
                                                message: 'Withdraw started...',
                                                description: 'stake account ' + item.pubkey.toString(),
                                                duration: 0,
                                            });

                                            let connection = new Connection(networkData[network].rpc, "confirmed");
                                            connection.getLatestBlockhashAndContext().then(data => {
                                                const transaction = new Transaction({
                                                    blockhash: data.blockhash,
                                                    feePayer: wallet.publicKey,
                                                 //   lastValidBlockHeight: data.lastValidBlockHeight,
                                                }).add(
                                                    StakeProgram.withdraw({
                                                        stakePubkey: item.pubkey,
                                                        authorizedPubkey: wallet.publicKey,
                                                        toPubkey: wallet.publicKey,
                                                        lamports: item.account.lamports,
                                                    }),
                                                );

                                                wallet.sendTransaction(transaction, connection, { minContextSlot: data.minContextSlot })
                                                .catch(err => {
                                                    return notification.error({
                                                        placement: 'bottomRight',
                                                        key:  item.pubkey.toString(),
                                                        message: 'Transaction error',
                                                        description: err.message,
                                                        duration: 15,
                                                    });
                                                })
                                                .then(signature => {
                                                    if (!signature)
                                                        return;
                                                    notification.open({
                                                        placement: 'bottomRight',
                                                        key: item.pubkey.toString(),
                                                        icon: antIcon,
                                                        message: 'Withdraw sended...',
                                                        description: 'stake account ' + item.pubkey.toString(),
                                                        duration: 0,
                                                    });

                                                    connection.confirmTransaction({
                                                        blockhash: data.blockhash,
                                                //        lastValidBlockHeight:data.lastValidBlockHeight,
                                                        signature
                                                    }).then(success => {
                                                        notification.success({
                                                            placement: 'bottomRight',
                                                            key: item.pubkey.toString(),
                                                            message: 'Withdraw success!',
                                                            description: 'stake account ' + item.pubkey.toString(),
                                                            duration: 15,
                                                        });
                                                        setTimeout(getStakes(), 3000);
                                                        setTimeout(getBalance(), 4000);
                                                    });
                                                });

                                            });

                                        }
                                    });
                                }}
                              >Withdraw</Button>,
     };

    return (

        <div className="stakes">
            <h1>Your stakes</h1>

            {(publicKey) && (<Button
                type="primary"
                className="newStakeButton"
                onClick={() => setNewOpen(true)}
                icon={<PlusOutlined />}
            >New stake</Button>)}

            <Drawer
                title="Create new stake(s)"
                onClose={() => setNewOpen(false)}
                open={newOpen}
                className="newStake"
                width={'30%'}
            >
                <Form
                    layout="vertical"
                >
                    <Form.Item
                        label="Select validator"
                        extra="For more APY, we recommend stake to validators with 10% or less commission"
                    >
                        <Select
                            style={{width:'100%'}}
                            placeholder="Search by name, pubkey, vote..."
                            showSearch
                            value={selectedValidator.vote}
                            optionFilterProp="children"
                            onChange={(e) => {
                                //console.log(e);
                                let val = validators.filter(i => i.vote == e)[0];
                                  /*
                                let s = selectedValidators;
                                s.push({
                                    validator: val,
                                    sol: 1,
                                });        */
                                setSelectedValidator(val);
                                setNewLamports(2);
                            }}
                            filterOption={(input, option) =>
                                  (option?.pubkey ?? '').toLowerCase().includes(input.toLowerCase())
                                  || (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                  || (option?.data?.name ?? '').toLowerCase().includes(input.toLowerCase())
                                  || (option?.data?.twitter ?? '').toLowerCase().includes(input.toLowerCase())
                                  || (option?.data?.keybaseUsername ?? '').toLowerCase().includes(input.toLowerCase())
                                  || (option?.data?.description ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={validators.map((item) => ({
                                label: <div className="valo">
                                    <div className="name">{item.data?.name || item.vote}</div>
                                    <div className="extra flex">
                                        <div className="comm">{item.commission || 0}%</div>
                                        <div className="staked">{(item.activestake / LAMPORTS_PER_SOL).toLocaleString('ru-RU', {style: 'currency', currency: 'SOL', maximumFractionDigits: 0})}</div>
                                        {(item.country !== '') && (<div className="location">
                                            <img src={"https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/" + item.country.toLowerCase() + '.svg'} />
                                            {item.country}, {item.city}
                                        </div>)}

                                    </div>
                                </div>,
                                value: item.vote,
                                data: item.data,
                                pubkey: item.pubkey,
                            }))}
                        >

                        </Select>
                        {(networkData[network].ourVote) && ( <Alert message={<div>We recommend our validator <Button type="link" size="small" onClick={() => { setSelectedValidator(validators.filter(i => i.vote == networkData[network].ourVote)[0]); }}>Synergy</Button></div>} type="info" showIcon />)}

                    </Form.Item>
                    {(selectedValidator.vote) && (
                        <Form.Item label="How many SOL?" extra={'min 2 SOL, max ' + (balance - 0.1) + ' SOL'}>
                            <InputNumber
                                value={newLamports || 2}
                                precision={2}
                                min={2}
                                max={balance - 0.1}
                                style={{width:'150px'}}
                                onChange={(e) => {
                                    setNewLamports(e);
                                }}
                            />
                        </Form.Item>
                    )}

                    {(selectedValidator.vote && newLamports >= 2 && newLamports <= (balance - 0.1)) && (<Form.Item extra="Stake will be activated in next epoch.">
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                const stakePubkey = Keypair.generate();
                                notification.open({
                                    placement: 'bottomRight',
                                    key: 'newstake',
                                    icon: antIcon,
                                    message: 'Stake started...',
                                    description: 'created new stake account ' + stakePubkey.publicKey.toString(),
                                    duration: 0,
                                });
                                let connection = new Connection(networkData[network].rpc, "confirmed");
                                connection.getRecentBlockhash('recent')
                                .catch(err => {
                                            return notification.error({
                                                placement: 'bottomRight',
                                                key: 'newstake',
                                                message: 'getLatestBlockhashAndContext error',
                                                description: err.message,
                                                duration: 15,
                                            });
                                        })
                                .then(data => {
                                    if (!data)
                                        return;
                                    const transaction = new Transaction({
                                        blockhash: data.blockhash,
                                        recentBlockhash: data.blockhash,
                                        feePayer: wallet.publicKey,
                                    }).add(
                                        StakeProgram.createAccount({
                                            fromPubkey: wallet.publicKey,
                                            stakePubkey: stakePubkey.publicKey,
                                            authorized: new Authorized(wallet.publicKey, wallet.publicKey),
                                            lockup: new Lockup(0, 0, wallet.publicKey),
                                            lamports: newLamports * LAMPORTS_PER_SOL,
                                        }),
                                        StakeProgram.delegate({
                                            stakePubkey: stakePubkey.publicKey,
                                            authorizedPubkey: wallet.publicKey,
                                            votePubkey: new PublicKey(selectedValidator.vote),
                                         }),
                                    );

                                    wallet.signTransaction(transaction)
                                        .catch(err => {
                                            console.log('SE1', err);
                                            return notification.error({
                                                placement: 'bottomRight',
                                                key: 'newstake',
                                                message: 'Signature error #1',
                                                description: err.message,
                                                duration: 0,
                                            });

                                        })
                                        .then(signed => {
                                            if (!signed)
                                                return;
                                            signed.partialSign(stakePubkey);
                                            notification.open({
                                                placement: 'bottomRight',
                                                key: 'newstake',
                                                icon: antIcon,
                                                message: 'Creating stake account...',
                                                duration: 0,
                                            });

                                            const rawTransaction = signed.serialize({ requireAllSignatures: false });
                                            connection.sendRawTransaction(rawTransaction)
                                            .catch(err => {
                                                console.log('sendRawTransaction', err);
                                                return notification.error({
                                                    placement: 'bottomRight',
                                                    key: 'newstake',
                                                    message: 'Signature error #2',
                                                    description: err.message,
                                                    duration: 0,
                                                });

                                            })
                                            .then(txid => {
                                                if (!txid)
                                                    return;
                                                connection.confirmTransaction(txid, "confirmed")
                                                .catch(err => {
                                                    return notification.error({
                                                        placement: 'bottomRight',
                                                        key: 'newstake',
                                                        message: 'Signature error #3',
                                                        duration: 0,
                                                    });
                                                })
                                                .then(success => {
                                                    if (!success)
                                                        return;
                                                    notification.success({
                                                        placement: 'bottomRight',
                                                        key: 'newstake',
                                                            message: 'Stake  created',
                                                            duration: 15,
                                                        });

                                                        setNewOpen(false);
                                                        setTimeout(getStakes(), 3000);
                                                        setTimeout(getBalance(), 4000);

                                                });
                                            });

                                        });


                                });
                            }}
                        >Stake it!</Button>
                    </Form.Item>) }

                </Form>
            </Drawer>

            <Modal
                open={modalOpen}
                onCancel={() => { setModalOpen(false); }}
                title={'Delegate stake'}
                okText={'Delegate'}
                onOk={() => {
                         notification.open({
                            placement: 'bottomRight',
                            key: modalStake.pubkey?.toString(),
                            icon: antIcon,
                            message: 'Delegation started...',
                            description: 'stake account ' + modalStake.pubkey?.toString(),
                            duration: 15,
                         });
                         let connection = new Connection(networkData[network].rpc);
                         connection.getLatestBlockhashAndContext()
                         .catch(err => {
                            return notification.error({
                                placement: 'bottomRight',
                                key: modalStake.pubkey?.toString(),
                                message: 'Signature error #1',
                                description: err.message,
                                duration: 0,
                            });
                         })
                         .then(data => {
                             if (!data)
                                return;
                             const transaction = new Transaction({
                                blockhash: data.blockhash,
                                feePayer: wallet.publicKey,
                               // lastValidBlockHeight: data.lastValidBlockHeight,
                             }).add(
                                 StakeProgram.delegate({
                                    stakePubkey: modalStake.pubkey,
                                    authorizedPubkey: wallet.publicKey,
                                    votePubkey: new PublicKey(vote),
                                 }),
                            );


                            wallet.sendTransaction(transaction, connection, { minContextSlot: data.minContextSlot })
                            .catch(err => {
                                return notification.error({
                                    placement: 'bottomRight',
                                    key: modalStake.pubkey?.toString(),
                                    message: 'Delegation error',
                                    description: err.message,
                                    duration: 0,
                                });
                             })
                            .then(signature => {
                                if (!signature)
                                    return;
                                notification.open({
                                    placement: 'bottomRight',
                                    key: modalStake.pubkey?.toString(),
                                    icon: antIcon,
                                    message: 'Delegation sended...',
                                    description: 'stake account ' + modalStake.pubkey?.toString(),
                                    duration: 30,
                                });

                                connection.confirmTransaction({
                                    blockhash: data.blockhash,
                                    signature
                                }).then(success => {
                                    notification.success({
                                        placement: 'bottomRight',
                                        key: modalStake.pubkey?.toString(),
                                        message: 'Delegation success!',
                                        description: 'Stake account will activated in next epoch',
                                        duration: 15,
                                    });
                                    setModalOpen(false);
                                    setTimeout(getStakes(), 3000);

                                });
                            });  //end Transaction
                        }); //getLatestBlockhashAndContext
                    }}
            >
                <p>Delegate {(modalStake.account?.lamports / LAMPORTS_PER_SOL).toLocaleString('ru-RU', {style: 'currency', currency: 'SOL', maximumFractionDigits: 0})} to validator: </p>
                <Select
                    value={vote}
                    onChange={(e) => setVote(e)}
                    style={{width:'100%'}}
                >{validators.map(i => <Select.Option key={i.vote}>{i.data?.name || i.vote}</Select.Option>)}</Select>
            </Modal>

            {stakesLoading
                ? <div className="loading">{antIcon}</div>
                : <div className="els">
                    {stakes.length == 0
                        ? <Empty description="No stakes found" />
                        : stakes.map((item, index) => {
                            let filter = validators.filter(v => v.vote == item.account?.data?.parsed?.info?.stake?.delegation?.voter);
                            let validator = {};
                            if (filter[0] !== undefined)
                                validator = filter[0];
                         //   console.log('validator', validator);

                            let status = 'active';
                            let actions = ['off'];
                            if (item.account?.data?.parsed?.info?.stake?.delegation?.activationEpoch == epoch?.epoch && item.account?.data?.parsed?.info?.stake?.delegation?.deactivationEpoch > epoch?.epoch)
                            {
                                status = 'activating';
                                actions = ['off'];
                            }
                            if (item.account?.data?.parsed?.info?.stake?.delegation?.deactivationEpoch <= epoch?.epoch)
                            {
                                status = 'inactive';
                                actions = ['delegate', 'withdraw'];
                            }
                            if (item.account?.data?.parsed?.info?.stake?.delegation?.deactivationEpoch == (epoch?.epoch + 1))
                            {
                                status = 'deactivating';
                                actions = ['delegate'];
                            }

                            if (item.account?.data?.parsed?.type == 'initialized')
                            {
                                status = 'inactive';
                                actions = ['delegate', 'withdraw'];
                            }

                           let lockup = false;
                            return <div className={"e flex " + status} key={index}>
                                       <div className="one">
                                           {validator.data?.keybasePicture !== undefined
                                                ? <Avatar src={validator.data?.keybasePicture} />
                                                : <Avatar />
                                           }
                                           <div className="data">
                                               <div className="account">{item.pubkey.toString()}</div>
                                               <div className="delegatedTo">delegated to&nbsp;
                                                    <span>
                                                    {   validator.pubkey
                                                        ? <Link to={"/validators/" + validator.pubkey}>{validator.data.name !== undefined ? validator.data.name : validator.pubkey}</Link>
                                                        : <Copier text={item.account?.data?.parsed?.info?.stake?.delegation?.voter} />
                                                    }
                                                    </span>
                                               </div>
                                                {(item.account?.data?.parsed?.info?.meta?.lockup?.epoch > 0 && item.account?.data?.parsed?.info?.meta?.lockup?.epoch < epoch.epoch) && (<div className="lockup">locked until epoch {item.account?.data?.parsed?.info?.meta?.lockup?.epoch}</div>)}

                                           </div>
                                       </div>
                                       <div className="stake">
                                             {(item.account?.lamports / LAMPORTS_PER_SOL).toLocaleString('ru-RU', {style: 'currency', currency: 'SOL', maximumFractionDigits: 0})}
                                       </div>
                                       <div className="actions">
                                            <Button.Group>
                                                {actions.map(act => buttons[act](item))}
                                            </Button.Group>
                                       </div>
                                </div>;
                            })
                    }
                </div>
            }
        </div>
    );
};

export default Stake;
