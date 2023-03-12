import { defineConfig } from "umi";

export default defineConfig({
  npmClient: 'yarn',
  title: 'Solist',
  hash: true,
  favicons: [
    'https://solist.app/favicon.ico',
    'https://solist.app/favicon.png',
    'https://solist.app/favicon.svg'
  ],  
  scripts: [
    {
        content: '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }} k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js", "ym"); ym(91978311, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, trackHash:true });',
        charset: 'utf-8',
    },
    {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-3KMTS4MMKL',
        async: true,
    },
    {
        content: ' window.dataLayer = window.dataLayer || [];  function gtag(){dataLayer.push(arguments);}     gtag(\'js\', new Date());  gtag(\'config\', \'G-3KMTS4MMKL\');',
        charset: 'utf-8',
    }
  ],
  https: {
    cert: '/etc/letsencrypt/live/solist.macrox.ru/fullchain.pem',
    key: '/etc/letsencrypt/live/solist.macrox.ru/privkey.pem',
  },
  plugins: [
    '@umijs/plugins/dist/antd',
    '@umijs/plugins/dist/model',
    '@umijs/plugins/dist/dva',
  ],
  dva: {
    immer: {
      enableES5: true,
      enableAllPlugins: true,
    },
  },
   proxy: {
        '/api': {
            target: 'https://solist.app',
            changeOrigin: true,
        },
   },
  model: {},

  antd: {
    configProvider: {},
    theme: {
        token: {
            colorPrimary: '#512da8',
            controlHeight: 48,
            controlInteractiveSize: 20,
            controlOutline: 'none',
            controlOutlineWidth: 0,
            controlPaddingHorizontal: 20,
            colorBorder: '#512da8',
            fontFamily: 'Inter,Roboto, sans-serif',
            borderRadius: 12,
        }
    }

  },
  extraBabelPlugins: process.env.NODE_ENV === 'production'
    ? ['babel-plugin-dynamic-import-node']
    : []
});
