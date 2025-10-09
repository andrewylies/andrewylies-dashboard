export default {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "airbnb",
        "airbnb/hooks",
        "airbnb-typescript",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: [
        "react",
        "react-hooks",
        "@typescript-eslint",
        "prettier",
    ],
    rules: {
        "prettier/prettier": "error",
        "react/react-in-jsx-scope": "off",
        "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
        "import/prefer-default-export": "off",
        "react/prop-types": "off",
    },
    settings: {
        react: { version: "detect" },
        "import/resolver": {
            typescript: {},
        },
    },
};