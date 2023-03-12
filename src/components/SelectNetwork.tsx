import React, { Component, FC } from 'react';
import { connect } from 'umi';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { Select, notification, Spin } from 'antd';
import {networks, networkData} from '../utils/config';

import { GlobalState, UmiComponentProps } from "@/common/type";

const mapStateToProps = ({ counter }: GlobalState) => {
    return counter;
};

type PageStateProps = ReturnType<typeof mapStateToProps>;

type PageProps = PageStateProps & UmiComponentProps;

const SelectNetwork: FC<PageProps> = function(props) {
    console.log('props', props);
    return (<div className="wallet flex">
            <div
                className="balance"
                onClick={() => {
                     props.dispatch({
                            type: 'blockchain/getBalance',
                        });
                }}
            >0 SOL</div>
            <div className="network">
                <Select
                    value={props.blockchain?.network}
                    style={{width:'150px'}}
                    onChange={(e) => {
                        props.dispatch({
                            type: 'blockchain/setNetwork',
                            payload: e,
                        }).then(result => {

                        });
                    }}
                >
                    {networks.map(key => <Select.Option key={key}>{networkData[key].name}</Select.Option>)}
                </Select>
            </div>
            <WalletMultiButton />
        </div>);

}

export default connect(mapStateToProps)(SelectNetwork);