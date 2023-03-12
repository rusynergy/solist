import { AccountInfo, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Table, Spin, notification, message, Badge, Avatar, Input, Button, Empty } from 'antd';
import {
    LoadingOutlined,
    GlobalOutlined,
    GithubOutlined,
    TwitterOutlined,
    RedditOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { useModel, useNavigate, useParams } from 'umi';
import { useState, useEffect, useCallback } from 'react';
import Copier from '../../components/Copier';
import './identity.css';

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

export default function NodeOne(props)
{
    const params = useParams();
    const {
        network,
        oneValidator,
        setOneValidator,
        oneValidatorLoading,
        getValidator
    } = useModel('networkModel');
    const navigate = useNavigate();

    useEffect(() => {
        getValidator(params.identity);
    }, []);

    useEffect(() => {

         if (oneValidator.data?.name)
             document.title = oneValidator.data.name + ' Solana ' + oneValidator.network + ' validator / Solist';
        else
            document.title = oneValidator.pubkey + ' Solana ' + oneValidator.network + ' validator / Solist';
    });

    if (oneValidatorLoading)
        return <div className="loading">{antIcon}</div>;
    if (oneValidator == false)
        return (<Empty description="Not found" />);
    return (<div className="oneValidator">
                <Button type="default" onClick={() => { return navigate("/validators", { replace: true }); }}>Back to all validators</Button>
                <div className="head">
                    {(oneValidator.data?.keybasePicture !== undefined && oneValidator.data?.keybasePicture)
                        ? <Avatar size="large" src={oneValidator.data?.keybasePicture} />
                        : <Avatar size="large" />
                    }
                    <div className="stake">
                        <div className="active">{(oneValidator.activestake / LAMPORTS_PER_SOL).toLocaleString('ru-RU', {style: 'currency', currency: 'SOL', maximumFractionDigits: 0})}</div>
                        <div className="commission">{oneValidator.commission}% commission</div>
                    </div>
                    <div className="info">
                        <h1>{oneValidator.data?.name !== undefined
                            ? oneValidator.data?.name
                            : oneValidator.pubkey
                        }</h1>
                        {(oneValidator.data?.details) && (<div className="desc">{oneValidator.data?.details}</div>)}
                        <div className="keys">
                            <div className="pubkey">Identity: <Copier text={oneValidator.pubkey} /></div>
                            <div className="vote">Vote: <Copier text={oneValidator.vote} /></div>
                        </div>
                        <div className="social flex">
                             {(oneValidator.data?.website) && (<a className="website" href={oneValidator.data?.website} target="_blank"><GlobalOutlined /></a>)}
                             {(oneValidator.data?.github) && (<a className="github" href={oneValidator.data?.github} target="_blank"><GithubOutlined /></a>)}
                             {(oneValidator.data?.twitter) && (<a className="twitter" href={oneValidator.data?.twitter} target="_blank"><TwitterOutlined /></a>)}
                             {(oneValidator.data?.reddit) && (<a className="reddit" href={oneValidator.data?.reddit} target="_blank"><RedditOutlined /></a>)}
                             {(oneValidator.data?.metrics) && (<a title="Grafana monitoring" className="metrics" href={'https://metrics.stakeconomy.com/d/f2b2HcaGz/solana-community-validator-dashboard?orgId=1&refresh=5m&var-pubkey=' + oneValidator.pubkey + '&var-server=' + oneValidator.data?.metrics + '&var-inter=1m&var-netif=All'} target="_blank"><DashboardOutlined /></a>)}
                        </div>
                    </div>
                </div>
                {(oneValidator.country !== '') && (<div className="location flex-wrap">
                    <div className="title"><span>Location</span></div>
                    <div className="dc">
                        <div className="ip"><Copier text={oneValidator.ip} /></div>
                        <div className="isp">{oneValidator.geo?.isp}</div>
                        <div className="as">{oneValidator.as}</div>
                    </div>
                    <div className="geo">
                        <div className="country">
                            <img src={"https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/" + oneValidator.country?.toLowerCase() + '.svg'} />  {oneValidator.geo?.country}
                        </div>
                        <div className="extra">{oneValidator.geo?.city}, {oneValidator.geo?.region}</div>
                    </div>
                    <div className="extra">
                        <div className="version">Ver. {oneValidator.version}</div>
                        {(oneValidator.rpc !== '') && (<div className="rpc">RPC: <Copier text={oneValidator.rpc} /></div>)}

                    </div>
                </div>)}
    </div>);
}