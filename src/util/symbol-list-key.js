'use strict'

const symbolToIdFactory = require(`./symbol-to-id`)

const symbolListKeyFactory = (newSymbol, description) => {
  const symbolToId = symbolToIdFactory()
  const map = new Map
  const compare = (a, b) => a === b ? 0 : a < b ? -1 : 1
  return symbolList => {
    const key = Array.from(symbolList).map(symbolToId).sort(compare).join(`,`)
    if (!map.has(key)) map.set(key, newSymbol(description))
    return map.get(key)
  }
}

module.exports = symbolListKeyFactory
