import js from "@eslint/js";
import react from "@eslint-react/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    // base recommended rules
    js.configs.recommended,

    // legacy compatibility layer (import plugin etc.)
    ...compat.extends("plugin:import/recommended"),

    // ignore patterns
    {
        ignores: ["coverage/**", "node_modules/**", "dist/**", "build/**"],
    },

    // main config
    {
        files: ["**/*.{ts,tsx,js,jsx}"],

        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        plugins: {
            react,
            "@typescript-eslint": tseslint,
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            indent: ["error", 4],
            "object-curly-spacing": ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "comma-spacing": ["error", { before: false, after: true }],
            "max-len": ["error", { code: 200 }],

            "@typescript-eslint/no-explicit-any": "error",

            "react/react-in-jsx-scope": "off",
            "react/require-default-props": "off",
        },
    },

    // JS override
    {
        files: ["**/*.js"],
        rules: {
            "@typescript-eslint/no-var-requires": "off",
        },
    },
];