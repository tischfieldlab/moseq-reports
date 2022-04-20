export default {
  // eslint
  '*.{js,ts,tsx,vue}': 'eslint --cache --fix',
  // typecheck
  'src/renderer/**/{*.ts,*.tsx,*.vue,tsconfig.json}': ({ filenames }) =>
    'npm run typecheck',
}
