const config = {
  plugins: [
    "@tailwindcss/postcss",
    // 🚀 CSS 최적화 (PostCSS 기반)
    ...(process.env.NODE_ENV === 'production' ? [
      // CSS 압축 및 최적화
      ['cssnano', {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifySelectors: true,
          minifyParams: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifyTimingFunctions: true,
          minifyTransforms: true,
          normalizeUrl: true,
          mergeLonghand: true,
          mergeRules: true,
          discardDuplicates: true,
          discardEmpty: true,
          discardOverridden: true,
          reduceIdents: true,
          zindex: false, // z-index 최적화 비활성화 (레이어 순서 보장)
        }]
      }]
    ] : [])
  ],
};

export default config;
