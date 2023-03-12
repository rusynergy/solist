import { AccountInfo, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Table, Spin, notification, message, Badge, Avatar, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useModel, useNavigate  } from 'umi';
import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet } from 'umi';
import Copier from '../../components/Copier';


import './index.css';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const NodesPage = () => {
    document.title = 'View solana mainnet validators, statistic and more with Solist';
    const { validators, validatorsLoading, getValidators, network, setOneValidator } = useModel('networkModel');
    const [ search, setSearch ] = useState('');
    useEffect(() => {
        getValidators();
    }, [network]);

    let navigate = useNavigate();
    let vals = validators;
    if (search !== '')
        vals = validators.filter(item => {
            let query = search.toLowerCase();
            if (item.pubkey.toLowerCase().indexOf(query) !== -1 || item.vote.toLowerCase().indexOf(query) !== -1)
                return true;
            if (item.data?.name?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.data?.keybaseUsername?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.data?.details?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.data?.twitter?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.data?.github?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.geo?.as?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.ip?.toLowerCase().indexOf(query) > -1)
                return true;
            if (item.city?.toLowerCase().indexOf(query) > -1)
                return true;

            return false;
        });

    let countries = [];
    let countriesTmp = {};
    for (let key in vals)
    {
        let e = vals[key];
        if (!e.country)
            continue;
        if (countriesTmp[e.country] !== undefined)
            continue;
        countriesTmp[e.country] = 1;
        countries.push({
            text: e.geo?.country || e.country,
            value: e.country,
        });
    }
    if (countries.length)
    countries.sort(function (a, b) {
        return ('' + a.text).localeCompare(b.text);
    });

    return (
        <div className="validators">
            <h1>Validators</h1>
            <div className="search">
                <Input
                    placeholder="Search validators..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    allowClear
                    size="large"
                />
            </div>
            <Table
                onRow={(record, rowIndex) => {
                    return {
                        onClick: (event) => {
                            /*
                            setOneValidator(record);
                            return navigate("/validators/" + record.pubkey, { replace: true });  */
                        }, // click row
                        onDoubleClick: (event) => {}, // double click row
                        onContextMenu: (event) => {}, // right button click row
                        onMouseEnter: (event) => {}, // mouse enter row
                        onMouseLeave: (event) => {}, // mouse leave row
                    };
                }}
                loading={validatorsLoading ? {indicator: antIcon} : false}
                dataSource={vals || []}
                rowClassName={(record, index) => record.status}
                pagination={{
                    position: ['bottomCenter'],
                    defaultPageSize: 50,
                }}
                columns={[
                    {
                        title: '#',
                        key: 'id',
                        width:'46px',
                        render: (text, row, index) => {
                            if (row.data?.keybasePicture !== undefined && row.data?.keybasePicture)
                                return <Avatar src={row.data?.keybasePicture} />;
                            return <Avatar />;
                        }
                    },
                    {
                        title: 'Validator',
                        dataIndex: 'pubkey',
                        key: 'pubkey',
                        render: (text, row, index) => {
                            return <div className="node">
                                 <Link to={"/validators/" + text} className="name">{row.data?.name || (row.pubkey != ''  ? row.pubkey : "Noname")}</Link>
                                 {(row.data?.name !== undefined) && (<div className="pubkey">Identity: <Copier text={row.pubkey} /></div>)}
                                  <div className="vote">Vote: <Copier text={row.vote} /></div>

                            </div>;
                        }
                    },
                    {
                        title: 'Stake',
                        key: 'stake',
                        width: '150px',
                        defaultSortOrder: 'descend',
                        sorter: (a, b) => a.activestake - b.activestake,
                        filters: [
                            { text:'0%', value: 0},
                            { text:'1% and more', value: 1 },
                            { text:'10% and more', value: 10 },
                            { text:'100%', value: 100},
                        ],
                        onFilter: (value: string, record) => {
                            if (value == 0)
                                return record.commission == value;
                             else
                                return record.commission >= value;
                            return false;
                        },
                        render: (text, row, index) => {
                            return <div className="stake">
                                <div className="active">{(row.activestake / LAMPORTS_PER_SOL).toLocaleString('ru-RU', {style: 'currency', currency: 'SOL', maximumFractionDigits: 0})}</div>
                                <div className="commission">{row.commission}% commission</div>
                            </div>;

                        }
                    },
                    {
                        title: 'Location',
                        key: 'location',
                        width: '150px',
                        onFilter: (value: string, record) => record.country == value,
                        filters: countries,
                        filterSearch: true,
                        render: (text, row, index) => {
                            return <div className="location">
                                   <div className="ip"><span>{row.ip}</span></div>
                                   {(row.country) && (<div className="geo">
                                       <img src={"https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/" + row.country.toLowerCase() + '.svg'} />
                                       {row.country}, {row.city}
                                   </div>)}

                            </div>;
                        }
                    },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        width: '100px',
                        onFilter: (value: string, record) => record.status == value,
                        filters: [
                            {text:'Active', value: 'active'},
                            {text:'Delinquent', value: 'delinquent'},
                        ],
                    }
                ]}
            />
        </div>
    );
};

export default NodesPage;
