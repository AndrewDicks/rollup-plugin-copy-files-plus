module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    overrides: [],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [
            'tsconfig.eslint.json',
            './tsconfig.json',
        ]
    },
    rules: {
        semi: 'error',
        '@typescript-eslint/no-inferrable-types': 'off'
    }
};
