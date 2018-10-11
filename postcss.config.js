module.exports = {
  plugins: [
    require('postcss-import')(),
    require('precss')(),
    // We need stage 2 for :not pseudo-class
    require('postcss-preset-env')({ stage: 2 }),
    require('postcss-ie11-pseudo-class'),
  ],
};
