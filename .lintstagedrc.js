module.exports = {
  '*.{js,json}': 'prettier -w --ignore-path .gitignore',
  '*.{ts,tsx}': (filenames) =>
    `next lint --fix --file ${filenames
      .map((file) => file.split(process.cwd())[1])
      .join(' --file ')}`
};
