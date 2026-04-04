// @ts-check

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...require("./base"),
  {
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

module.exports = config;
