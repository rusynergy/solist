import axios from 'axios';
import {cloneDeep, isEmpty} from 'lodash';
import { pathToRegexp, parse, compile } from 'path-to-regexp';
import {message} from 'antd';
import qs from 'qs';

// const {CancelToken} = axios;
// window.cancelRequest = new Map();

export default function request(options) {
    let {data = {}, url, method = 'get', crossDomain = true} = options;
    const cloneData = cloneDeep(data);

    let hasFile = false;
    Object.values(data).forEach(d => {
        if (d instanceof File) {
            hasFile = true;
        }
    });
    if (hasFile) {
        // Pass every value to FormData that supports file upload
        const formData = new FormData();
        Object.keys(data).forEach(name => {
            let value = data[name];
            if (typeof value === "boolean") {
                value = Number(value);
            }
            if (typeof value === "undefined") {
                value = '';
            }
            formData.append(name, value);
        });
        options.data = formData;
    }

    try {
        let domain = '';
        const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/);
        if (urlMatch) {
            ;[domain] = urlMatch;
            url = url.slice(domain.length);
        }

        const match = parse(url);
        url = compile(url)(data);

        for (const item of match) {
            if (item instanceof Object && item.name in cloneData) {
                delete cloneData[item.name];
            }
        }
        url = domain + url;
    } catch (e) {
        console.log('error', e);
        message.error(e.message + '/' + url);
    }

    options.url = method.toLocaleLowerCase() === 'get'
        ? `${url}${isEmpty(cloneData) ? '' : '?'}${qs.stringify(cloneData)}`
        : url;

    // options.cancelToken = new CancelToken(cancel => {
    // 	window.cancelRequest.set(Symbol(Date.now()), {
    // 		pathname: window.location.pathname,
    // 		cancel,
    // 	});
    // });

    options.crossDomain = true;
    if (localStorage.getItem('apikey') !== undefined)
    {
        options.headers =  {
         'x-api-key': localStorage.getItem('apikey'),
        };
    }


    return axios(options)
        .then(response => {
            const {statusText, status, data, headers} = response;

            return Promise.resolve({
                success: true,
                message: statusText,
                statusCode: status,
                data,
                headers,
            });
        })
        // .then(value => new Promise(resolve => {
        // 	setTimeout(() => {
        // 		resolve(value);
        // 	}, 1000);
        // }))
        .catch(error => {
            const {response, message} = error;

            if (String(message) === 'cancel request') {
                return {
                    success: false,
                };
            }

            let msg;
            let statusCode;

            if (response && response instanceof Object) {
                const {data} = response;
                statusCode = response.status;

                // if ([403,422].includes(statusCode)) {
                // }

                return Promise.resolve({
                    success: false,
                    statusCode,
                    data,
                });

                // msg = data.message || response.statusText;
            } else {
                statusCode = 600;
                msg = error.message || 'Network Error';
            }

            /* eslint-disable */
            return Promise.reject({
                success: false,
                statusCode,
                message: msg,
            });
        });
}
