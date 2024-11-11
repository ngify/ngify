const nx = require('@nx/eslint-plugin');
const stylistic = require('@stylistic/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const { Linter } = require('eslint');

/** @type Linter.Config[] */
module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  stylistic.configs['recommended-flat'],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-irregular-whitespace': [
        'error',
        {
          skipStrings: true,
          skipComments: true,
          skipRegExps: true,
          skipTemplates: true
        }
      ],
      'no-constant-condition': [
        'error',
        {
          checkLoops: false
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          args: 'none'
        }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: [
            'PascalCase'
          ]
        }
      ],
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          ignoreRestArgs: true
        }
      ]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@stylistic/indent': [
        'error',
        2,
        {
          SwitchCase: 1
        }
      ],
      '@stylistic/linebreak-style': [
        'error',
        'unix'
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      '@stylistic/semi': [
        'error',
        'always'
      ],
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0
        }
      ],
      '@stylistic/keyword-spacing': [
        'error',
        {
          before: true
        }
      ],
      '@stylistic/space-before-blocks': [
        'error',
        'always'
      ],
      '@stylistic/block-spacing': [
        'error',
        'always'
      ],
      '@stylistic/object-curly-spacing': [
        'error',
        'always'
      ],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      '@stylistic/arrow-spacing': [
        'error',
        {
          before: true,
          after: true
        }
      ],
      '@stylistic/comma-spacing': [
        'error',
        {
          before: false,
          after: true
        }
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true
          },
          ObjectPattern: {
            multiline: true,
            consistent: true
          },
          ImportDeclaration: 'never',
          ExportDeclaration: {
            multiline: true,
            consistent: true
          }
        }
      ],
      '@stylistic/array-element-newline': [
        'error',
        'consistent'
      ],
      '@stylistic/brace-style': [
        'error',
        '1tbs'
      ],
      '@stylistic/comma-dangle': [
        'error',
        'never'
      ],
      '@stylistic/arrow-parens': [
        'error',
        'as-needed'
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false
          },
        }
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            '?': 'before',
            ':': 'before'
          }
        }
      ]
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.base.json'
        }
      }
    },
    rules: {
      'import/order': 'warn',
      'import/no-cycle': 'error',
      'import/no-deprecated': 'warn',
    }
  }
  // {
  //   files: ['**/*.json'],
  //   rules: {
  //     '@nx/dependency-checks': [
  //       'error',
  //       {
  //         ignoredFiles: [
  //           '{projectRoot}/*.config.{js,cjs,mjs,ts}',
  //           '{projectRoot}/**/*.spec.ts',
  //         ],
  //         ignoredDependencies: [
  //           'miniprogram-api-typings'
  //         ]
  //       },
  //     ],
  //   },
  //   languageOptions: {
  //     parser: require('jsonc-eslint-parser'),
  //   },
  // },
];
