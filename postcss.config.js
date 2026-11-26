export default {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      // Styles are authored at a 1920 × 1080 reference resolution. The root
      // font size scales from 16px to 32px between 1080p and 4K.
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['html', 'body'],
      minPixelValue: 2,
    },
  },
}
