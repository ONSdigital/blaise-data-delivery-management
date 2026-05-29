import js from "@eslint/js";
import react from "@eslint-react/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";


export default tseslint.config(
    // base recommended rules
    js.configs.recommended,
    react.configs.recommended,
    importX.flatConfigs.recommended,

    ...tseslint.configs.recommended,

    // ignore patterns
    {
        ignores: ["coverage/**", "node_modules/**", "dist/**", "build/**", "eslint.config.ts"],
    },

    // main config
    {
        files: ["**/*.{ts,tsx,js,jsx}", "**/*.test.*", "**/*.spec.*"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: react,
            import: importX,
        },

        settings: {
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    project: ["./tsconfig.json"],
                }),
            ],
            react: {
                version: "detect",
            },
        },

        rules: {
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: "return" },
                { blankLine: "always", prev: "import", next: "*" },
                { blankLine: "any", prev: "import", next: "import" },
                { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
                { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
                { blankLine: "always", prev: "*", next: ["class", "function", "export"] },
                { blankLine: "always", prev: ["block-like", "multiline-block-like"], next: "*" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "sort-imports": [
                "error",
                { ignoreCase: true, ignoreDeclarationSort: true, ignoreMemberSort: false },
            ],
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            indent: ["error", 4],
            "object-curly-spacing": ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "comma-spacing": ["error", { before: false, after: true }],
            "max-len": ["error", { code: 200 }],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                    caughtErrors: "none"
                }
            ],
            "@typescript-eslint/no-empty-function": "error"
        },
    },

    // JS override
    {
        files: ["**/*.js"],
        rules: {
            "@typescript-eslint/no-var-requires": "off",
        },
    },
    {
        files: [
            "**/*.test.*",
            "**/*.spec.*",
            "**/jest.setup.ts",
        ],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "no-empty": "off",
        },
    },
    {
        files: ["**/__snapshots__/*"],
        rules: {
            "max-len": "off",
        },
    },
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        rules: {
            "no-unused-vars": "off",
        },
    },
    {
        files: ["**/*.setup.ts", "**/jest.*.ts", "**/jest.config.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    }
);