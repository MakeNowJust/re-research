'use strict'

const {EPSILON} = require(`./consts`)
const symbolDescription = require(`./util/symbol-description`)
const newSymbolFactory = require(`./util/new-symbol`)
const deltaFactory = require(`./util/delta`)

// `toNFA` converts *root* node of Regular Expression to NFA.
//
// NOTE: This function cannot convert look-ahead/behind directly.
const toNFA = (name, sigma, root) => {
  const newSymbol = newSymbolFactory()

  const {delta, defDelta} = deltaFactory()

  const cons = (next, node) => {
    switch (node.type) {
      case `alt`: {
        const current = newSymbol(`alt`)
        node.nodes.forEach(node => defDelta(current, EPSILON, cons(next, node)))
        return current
      }

      case `concat`:
        return node.nodes.reduceRight(cons, next)

      case `optional`: {
        const next2 = newSymbol(`optional`)
        const current = cons(next2, node.node)
        defDelta(current, EPSILON, next2)
        defDelta(next2, EPSILON, next)
        return current
      }

      case `many`: {
        const current = newSymbol(`many`)
        defDelta(current, EPSILON, next)
        defDelta(current, EPSILON, cons(current, node.node))
        return current
      }

      case `some`: {
        const next2 = newSymbol(`some`)
        const current = cons(next2, node.node)
        defDelta(next2, EPSILON, current)
        defDelta(next2, EPSILON, next)
        return current
      }

      case `empty`:
        return next

      case `any`: {
        const current = newSymbol(`any`)
        sigma.forEach(c => defDelta(current, c, next))
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
