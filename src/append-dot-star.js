'use strict'

const {EPSILON} = require(`./consts`)
const symbolDescription = require(`./util/symbol-description`)

const appendDotStar = (sigma, {name, delta, start: start1, finish}) => {
  const start = Symbol(`${symbolDescription(name)}#dot-star`)

  const trans = new Map
  trans.set(EPSILON, new Set([start1]))
  for (const c of sigma)
    trans.set(c, new Set([start]))
  delta.set(start, trans)

  return {name, delta, start, finish}
}

module.exports = appendDotStar
