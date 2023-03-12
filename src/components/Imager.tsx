import './Imager.css';
import { LoadingOutlined } from '@ant-design/icons';
import { notification, List, Spin, Empty } from "antd";
import { useState } from 'react';


const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function Imager(props)
{

    const [loading, setLoading] = useState(true);

    return (
     <div
        className={"imager" + (loading ? ' loading': ' loaded')}
     >
        {(loading == true) && (antIcon)}
        <img
          src={props.src}
          alt={props.alt}
          onLoad={() => setLoading(false)}
        />
     </div>
    );
}
