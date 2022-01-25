module.exports = {
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  trailingComma: 'none',
  importOrder: ['^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    'classProperties',
    'decorators-legacy'
  ],
  tailwindConfig: './tailwind.config.js',
  plugins: [
    require.resolve('@trivago/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-tailwindcss')
  ]
};
