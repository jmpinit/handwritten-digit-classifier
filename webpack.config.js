module.exports = [
  {
    name: 'client-side',
    entry: './src/main.js',
    output: {
      path: __dirname,
      filename: 'public/js/app.js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          query: {
            plugins: [],
            presets: ['es2015'],
          },
        },
      ],
    },
  },
];
