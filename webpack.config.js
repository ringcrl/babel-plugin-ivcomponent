const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = (env) => {
  if (!env || !env.comp) {
    throw new Error('请参考 README，提供组件名称');
  }
  const compName = env.comp;

  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: path.resolve(__dirname, 'src', `${compName}.vue`),
    output: {
      filename: `${compName}.js`,
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        // 它会应用到普通的 `.js` 文件
        // 以及 `.vue` 文件中的 `<script>` 块
        {
          test: /\.js$/,
          use: {
            // loader: path.resolve(__dirname, './compile/iv-loader.js'),
            loader: 'babel-loader',
            options: {
              plugins: ['./lib/babel-plugin-ivcomponent.js'],
              presets: ['@babel/preset-env'],
            },
          },
        },
        // 它会应用到普通的 `.css` 文件
        // 以及 `.vue` 文件中的 `<style>` 块
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader',
          ],
        },
        // 普通的 `.scss` 文件和 `*.vue` 文件中的
        // `<style lang="scss">` 块都应用它
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
    ],
    optimization: {
      minimizer: [],
    },
  };
};
