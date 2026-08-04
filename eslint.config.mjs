import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

const unusedVarsOptions = {
  argsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
};

const tsRecommended = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['client/**/*.{ts,tsx}'],
}));

export default [
  {
    ignores: ['dist/', 'node_modules/', 'client/dist/'],
  },
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
  },
  ...tsRecommended,
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['error', unusedVarsOptions],
    },
  },
  {
    files: ['client/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', unusedVarsOptions],
    },
  },
  {
    files: ['client/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['server/tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
  {
    files: ['client/vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
];
