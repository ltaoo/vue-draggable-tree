const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/tree/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vue-draggable-tree.min.js',
    library: 'VueDraggableTree',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src')],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        include: [path.join(__dirname, 'src')],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
      },
    ],
  },
  externals: {
      vue: 'vue',
      classnames: 'classnames',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};
