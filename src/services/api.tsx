
const endpoints =  {
    version: '/',
    validators: '/validators/',
    one: '/validators/one/',
};

import request from '../utils/request';
import {apiPrefix} from '../utils/config';

const gen = params => {
    let url = apiPrefix + params;
    let method = 'GET';

    const paramsArray = params.split(' ');
    if (paramsArray.length === 2) {
        method = paramsArray[0];
        url = apiPrefix + paramsArray[1];
    }

    return function(data) {
        console.log(method, url, data);
        return request({
            url,
            data,
            method,
        });
    };
};

const api = {};

for (const key in endpoints)
    api[key] = gen(endpoints[key]);

export default api;
