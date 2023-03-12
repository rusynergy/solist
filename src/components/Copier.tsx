import './Copier.css';
import { Outlet } from 'umi';
import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';


export default function Copier(props) {

    return (
     <span
        className="copier"
        onClick={() => {
            if ('clipboard' in navigator) {
                navigator.clipboard.writeText(props.text);
              } else {
                 document.execCommand('copy', true, props.text);
              }
            message.success(props.text + ' copied to clipboard');
        }}
     >
            {props.text} <CopyOutlined />

     </span>
    );
}
