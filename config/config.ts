// config/config.ts
export default {
    antd: {
        // configProvider
        configProvider: {},
        // themes
        dark: true,
        compact: false,
        // babel-plugin-import
        import: true,
        // less or css, default less
        style: 'less',
        // shortcut of `configProvider.theme`
        // use to configure theme token, antd v5 only
        theme: {
            '@primary-color': '#512da8',
            dark: true,
        },
    },
};