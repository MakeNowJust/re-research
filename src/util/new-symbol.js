'use strict'

const newSymbolFactory = (id = 0) => description => Symbol(`${description}#${id++}`)

module.exports = newSymbolFactory
