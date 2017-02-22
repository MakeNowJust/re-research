'use strict'

const {EPSILON} = require(`./consts`)
const symbolDescription = require(`./util/symbol-description`)
const newSymbolFactory = require(`./util/new-symbol`)

// toNFA converts *root* node of Regular Expression to NFA.
//
// NOTE: This function cannot convert look-ahead/behind directly.
const toNFA = (name, root, sigma) => {
  const newSymbol = newSymbolFactory()

  const delta = new Map
  const defDelta = (from, value, to) => {
    if (!delta.has(from)) delta.set(from, new Map)
    const values = delta.get(from)
    if (!values.has(value)) values.set(value, new Set)
    values.get(value).add(to)
  }

  const cons = (next, node) => {
    switch (node.type) {
      case `alt`: {
        const current = cons(next, node.nodes[0])
        node.nodes.slice(1).forEach(node => defDelta(current, EPSILON, cons(next, node)))
        return current
      }

      case `concat`:
        return node.nodes.reduceRight(cons, next)

      case `optional`: {
        const current = cons(next, node.node)
        defDelta(current, EPSILON, next)
        return current
      }

      case `many`: {
        const current = newSymbol(`many`)
        defDelta(current, EPSILON, next)
        defDelta(current, EPSILON, cons(current, node.node))
        return current
      }

      case `some`: {
        const current = cons(next, node.node)
        defDelta(next, EPSILON, current)
        return current
      }

      case `empty`:
        return next

      case `any`: {
        const current = newSymbol(`any`)
        sigma.forEach(value => defDelta(current, value, next))
        return current
      }

      case `char`: {
        const name = typeof node.value === `symbol` ? `symbol[${symbolDescription(node.value)}]` : `char[${node.value}]`
        const current = newSymbol(name)
        defDelta(current, node.value, next)
        return current
      }

      case `positive-look-ahead`:
      case `negative-look-ahead`:
      case `positive-look-behind`:
      case `negative-look-behind`:
        throw new Error(`can't convert look ahead/behind to NFA directly`)

      default:
        throw new Error(`unknown type: ${node.type}`)
    }
  }

  const finish = newSymbol(`finish`)
  const start = cons(finish, root)

  return {name, delta, start, finish: new Map([[finish, new Set([name])]])}
}

module.exports = toNFA
