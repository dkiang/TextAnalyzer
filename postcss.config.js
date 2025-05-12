module.exports = {
    plugins: [
        require('postcss-preset-env')({
            features: {
                'nesting-rules': true,
                'custom-properties': true,
                'custom-media-queries': true,
                'media-query-ranges': true
            },
            autoprefixer: {
                flexbox: 'no-2009'
            },
            stage: 3
        }),
        require('autoprefixer')
    ]
}; 