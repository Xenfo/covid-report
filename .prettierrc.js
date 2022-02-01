const merge = require('lodash.merge');
const sortImports = require('@trivago/prettier-plugin-sort-imports');
const tailwindcss = require('prettier-plugin-tailwindcss');

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
  plugins: [merge(sortImports, tailwindcss)]
};
