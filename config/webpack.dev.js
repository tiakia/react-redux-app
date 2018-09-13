const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const CommonConfig = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const CleanPlugin = require('clean-webpack-plugin');

const AppPort = require('./port.js').port;

const common = CommonConfig.config,
      Path = CommonConfig.Path,
      publicPath = CommonConfig.publicPath;

const devLoaders = [
  {
    test: /\.css$/,
    use: ['style-loader','css-loader','postcss-loader']
  },
  {
    test: /\.scss$/i,
    use: ['style-loader','css-loader','postcss-loader','sass-loader']
  },
  {
    test: /\.less$/i,
    use: ['style-loader','css-loader','postcss-loader','less-loader']
  }
];

const devPlugins = [
  new HtmlWebpackPlugin({
    title: 'React-Redux-App',
    inject: true,
    template: Path('../static/tpl.html'),
    chunksSortMode: 'none'
  }),
  new AddAssetHtmlPlugin([
    {
      filepath: Path('../static/js/vendors_lib.js'),
      includeSourcemap: false
    },
    {
      filepath: Path('../build/*.js'),
      includeSourcemap: false
    }
  ]),
  // 显示 模块的 相对路径
  new webpack.NamedModulesPlugin(),
  // 浏览器 刷新
  new webpack.HotModuleReplacementPlugin(),
  // 定义一个全局变量
  new webpack.DefinePlugin({
    //'process.env.NODE_ENV': JSON.stringify('development')
  }),
  new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(path.resolve(__dirname, '../static/vendors-manifest.json'))
  }),
  new OpenBrowserPlugin({
      url: `http://localhost:${AppPort}`
  }),
  new CleanPlugin(['build/*.*'],{
        root: Path('../')
  })
];

const devConfig = merge(common,{
  devtool: 'inline-source-map',
  entry: {
      index: [
          `webpack-dev-server/client?http://localhost:${AppPort}`,
          'webpack/hot/only-dev-server',
          'react-hot-loader/patch',
          'babel-polyfill',
          Path('../src/main.js')
      ]
  },
  output: {
    path: Path('../build/'),
    filename: '[name].[hash:5].js',
    publicPath: publicPath
  },
  optimization: {
    minimize: false,
    runtimeChunk: true,
    mergeDuplicateChunks: true,
    removeEmptyChunks: true,
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all"
        }
      }
    }
  },
  module: {
    rules: devLoaders
  },
  mode: "development",
  plugins: devPlugins
});

new WebpackDevServer(webpack(devConfig),{
    clientLogLevel: 'none',
    contentBase: Path('../static'),
    historyApiFallback: true,
    hot: true,
}).listen(AppPort, 'localhost', (err, result) => {
    if(err){
        console.log(err);
    }
    console.log(`Listening at http://localhost:${AppPort}`);
});