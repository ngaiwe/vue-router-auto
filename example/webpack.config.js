const ip = require('ip')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const portfinder = require('portfinder')
const CreateRouter = require('../index.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/auto/'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        exposeFilename: true,
        transformAssetUrls: {
          video: ['src', 'poster'],
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      }
    }]
  },
  devServer: {
    clientLogLevel: 'warning', // 在开发者工具响应信息 noen|waring|error|info默认
    historyApiFallback: { // 404响应页面 默认index.html
      rewrites: [{
        from: /.*/,
        to: path.posix.join('/auto/', 'index.html')
      }],
    },
    hot: true, // 模块热替换
    contentBase: path.resolve(__dirname,'/dist'), // 是否启动指定获取相关静态目录信息 默认工作目录
    compress: true, // 启动gzip压缩
    host: HOST || 'localhost', // IP
    port: PORT || 8080, // 端口
    open: true, // 打开浏览器 --open 'Google Chrome' 打开google
    openPage: 'auto', // 自动打开的页面
    overlay: { // 是否全面显示警告和错误
      warnings: false,
      errors: true
    },
    publicPath: '/auto/', // 启动后的路径前缀
    proxy: {}, // 代理
    quiet: true, // 去除启动后的webpack警告和错误信息
    watchOptions: {
      aggregateTimeout: 500, // 设置延时重构更新
      ignored: /node_modules/, // 忽略大型文件更改产生的影响 
      poll: false, // 指定时间轮训看是否有文件改动 用于处理webpack-dev-server热更新不正常 boolean|Number
    },
    disableHostCheck: true // 绕过主机检查
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, 'src'),
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(), // 模块热替换devserver结合使用
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      filename: path.resolve(__dirname, 'dist','index.html'),
      inject: true
    }),
    new CreateRouter({
      contentBase: path.resolve(__dirname),
      base: '/auto/',
      watcher: true
    })
  ]
}

// 用于处理端口重复问题
module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || 8080
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`当前项目地址IP和端口号：http://${ip.address()}:${port}`],
        },
        onErrors: true
      }))
      // 处理端口冲突
      resolve(merge(devWebpackConfig, {
        devServer: {
          port
        }
      }))
    }
  })
})