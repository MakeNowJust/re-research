'use strict'

const symbolToIdFactory = require(`./symbol-to-id`)
const symbolDescription = require(`./symbol-description`)

// `symbolListKeyFactory` is a factory to create function to generate a symbol from symbol list.
const symbolListKeyFactory = (newSymbol, description) => {
  const symbolToId = symbolToIdFactory()
  const map = new Map
  const compare = (a, b) => a === b ? 0 : a < b ? -1 : 1
  return (symbolList, desc = `${description}(${Array.from(symbolList).map(symbolDescription).join(`,`)})`) => {
    const key = Array.from(symbolList).map(symbolToId).sort(compare).join(`,`)
    if (!map.has(key)) map.set(key, newSymbol(desc))
    return map.get(key)
  }
}

module.exports = symbolListKeyFactory
