// ${projectRoot}/plugin.ts

import { IApi } from 'umi';

export default (api: IApi) => {
    api.modifyHTML(($) => {
        $('head').append([
            `<script src='https://terminal.jup.ag/main-v1.js' data-preload="true"></script>`,
        ])
        return $;
    });
};