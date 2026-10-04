import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:customer',
              onlyDependOnLibsWithTags: ['scope:customer', 'scope:shared'],
            },
            {
              sourceTag: 'scope:staff',
              onlyDependOnLibsWithTags: ['scope:staff', 'scope:shared'],
            },
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here.
    //
    // Unused locals/params used to be enforced by the TS compiler
    // (noUnusedLocals/noUnusedParameters in tsconfig.base.json), which made
    // them hard build errors - annoying mid-feature (e.g. an `inject()` you
    // added but haven't wired into the template yet). Enforcing it here
    // instead keeps it a visible warning in the editor and in `nx lint`,
    // without blocking `nx serve`/`nx build` while you're still working.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
