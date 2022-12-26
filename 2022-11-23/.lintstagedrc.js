const fs = require('fs');
const generateTSConfig = (fileName, type) => {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    const include = ['src/**/*.d.ts', ...fileName].filter(
        (file) => !file.includes('TabContent'),
    );
    tsconfig.include = include;
    fs.writeFileSync('tsconfig.lint.json', JSON.stringify(tsconfig));
    return `${type} --noEmit --project tsconfig.lint.json`;
};

module.exports = {
    'src/**/*.{ts,tsx}': ['yarn prettier', 'yarn eslint-fix',(fileName) => generateTSConfig(fileName, 'tsc')],
    'src/**/*.{css,less,scss}': ['yarn stylelint-fix'],
};
