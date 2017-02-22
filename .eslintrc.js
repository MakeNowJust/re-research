'use strict'

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: `eslint:recommended`,
  rules: {
    [`linebreak-style`]: [`error`, `unix`],
    [`no-trailing-spaces`]: `error`,
    curly: [`error`, `multi-or-nest`, `consistent`],
    indent: [`error`, 2, {SwitchCase: 1}],
    quotes: [`error`, `backtick`],
    semi: [`error`, `never`],
    strict: [`error`, `global`]
  }
}
