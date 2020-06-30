# babel-plugin-ivcomponent

适用于开发 https://m.v.qq.com/txi/dev/ 组件的 babel plugin。

# 安装与使用

```sh
npm install @chenng/babel-plugin-ivcomponent -D
```

```js
// webpack.config.js
rules: [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        plugins: ['@chenng/babel-plugin-ivcomponent'], // 配置插件
        presets: ['@babel/preset-env'],
      }
    }
  }
]
```

# 本地调试

```sh
# 开发
comp="Bubble" npm run dev

# 打包
comp="Bubble" npm run build
```