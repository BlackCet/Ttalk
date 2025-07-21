import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config' // Removed 'globalIgnores' from import, it's a function not a class

export default defineConfig([
  globalIgnores(['dist']), // This is correct for ignoring the dist folder
  {
    // Main configuration for your React frontend files
    files: ['**/*.{js,jsx}'],
    // Ensure you also include your TS/TSX files if you have them, e.g., '**/*.{js,jsx,ts,tsx}'
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020, // Or 'latest'
      globals: {
        ...globals.browser, // Standard browser globals for React files
        // Add specific globals if you use them without importing, like 'process' if needed for env variables
        // process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Add other React-specific rules here
    },
  },
  {
    // NEW CONFIGURATION SECTION for Node.js config files (tailwind.config.js, postcss.config.js)
    files: ['tailwind.config.js', 'postcss.config.js'], // Target these specific files
    languageOptions: {
      globals: {
        ...globals.node, // Expose Node.js globals (module, require, process, __dirname, etc.)
      },
      sourceType: 'commonjs', // These files use CommonJS modules
      ecmaVersion: 2020, // You can specify a Node.js compatible ECMAScript version
    },
    // You might want to remove or adjust rules for these config files
    rules: {
      // For example, if you don't want 'no-unused-vars' on these files
      // 'no-unused-vars': 'off',
      // Or if you want to allow global 'module' and 'require' without warning
      'no-undef': 'off',
    },
  },
  // Add another configuration object if you have TypeScript files
  // {
  //   files: ['**/*.{ts,tsx}'],
  //   extends: [
  //     // ... your TypeScript specific ESLint plugins and configs
  //   ],
  //   languageOptions: {
  //     parser: '@typescript-eslint/parser',
  //     parserOptions: {
  //       project: './tsconfig.json', // Path to your tsconfig
  //     },
  //     globals: globals.browser,
  //   },
  // },
])