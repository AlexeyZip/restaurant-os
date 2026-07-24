import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                      {
                        sourceTag: "scope:customer",
                        onlyDependOnLibsWithTags: ["scope:customer", "scope:shared"]
                      },
                      {
                        sourceTag: "scope:staff",
                        onlyDependOnLibsWithTags: ["scope:staff", "scope:shared"]
                      },
                      {
                        sourceTag: "scope:api",
                        onlyDependOnLibsWithTags: ["scope:api", "scope:shared"]
                      },
                      {
                        sourceTag: "type:ui",
                        onlyDependOnLibsWithTags: ["type:ui", "type:util"]
                      }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
