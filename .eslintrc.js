module.exports = {
  extends: ["standard", "plugin:prettier/recommended"],
  plugins: ["mocha", "chai"],
  rules: {
    "one-var": ["error", "never"],
    "prettier/prettier": "error",
    "no-unused-vars": [
      2,
      { vars: "all", varsIgnorePattern: "^_", args: "all", argsIgnorePattern: "^_" },
    ],
  },
  env: {
    node: true,
    mocha: true,
  },
  globals: {
    expect: true,
  },
};
