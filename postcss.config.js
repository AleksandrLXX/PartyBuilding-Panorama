export default {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 192,
      propList: ['*'],
      selectorBlackList: ['html', 'body'],
      minPixelValue: 2,
    },
  },
}
