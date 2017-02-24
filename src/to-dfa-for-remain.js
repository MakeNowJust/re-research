'use strict'

const {EPSILON} = require(`./consts`)
const appendEnd = require(`./append-end`)
const concat = require(`./util/generator-concat`)
const pow = require(`./util/set-pow`)
const subsetEq = require(`./util/set-subset-eq`)
const symbolDescription = require(`./util/symbol-description`)
const symbolListKeyFactory = require(`./util/symbol-list-key`)

const toDFAForRemain = (newSymbol, sigma, look, nfa) => {
  const {name, delta: delta1, start: start1, finish: finish1} = appendEnd(sigma, nfa)

  const symbolListKey = symbolListKeyFactory(newSymbol, symbolDescription(name))

  const lookSet = new Set(concat(look.ahead.keys(), look.behind.keys()))
  const lookPowSet = pow(lookSet)

  const newCharKey = symbolListKeyFactory(Symbol, ``)
  const newChar = (c, conds) => {
    if (conds.size === 0) return c
    c = typeof c === `symbol` ? symbolDescription(c) : `'${c}'`
    return newCharKey(new Set(conds).add(c), `${c}, ${Array.from(conds).map(symbolDescription).join(`&`)}`)
  }
  // Register a character and available look ahead/behind pattern.
  for (const c of sigma)
    for (const conds of lookPowSet) newChar(c, conds)

  const delta = new Map

  const follow = (q, visiting, conds, next) => {
    if (visiting.has(q)) return
    visiting.add(q)

    if (delta1.has(q)) {
      let pushed = false
      for (const [c1, tos1] of delta1.get(q)) {
        if (c1 === EPSILON) {
          for (const q1 of tos1) follow(q1, visiting, conds, next)
        } else if (lookSet.has(c1)) {
          for (const q1 of tos1) follow(q1, visiting, new Set(conds).add(c1), next)
        } else {
          if (!pushed) {
            next.push([q, conds])
            pushed = true
          }
        }
      }
    }

    visiting.delete(q)
  }

  const cons = qs => {
    const key = symbolListKey(qs)
    if (delta.has(key)) return key
    const trans = new Map
    delta.set(key, trans)

    const next = []
    const visiting = new Set
    const conds = new Set
    for (const q of qs) follow(q, visiting, conds, next)

    for (const conds of lookPowSet) {
      const qs2 = new Set
      for (const [q2, conds2] of next)
        if (subsetEq(conds2, conds)) qs2.add(q2)


      for (const c of sigma) {
        const qs3 = new Set
        for (const q2 of qs2) {
          if (delta1.has(q2) && delta1.get(q2).has(c))
            for (const q3 of delta1.get(q2).get(c)) qs3.add(q3)

        }
        if (qs3.size > 0)
          trans.set(newChar(c, conds), new Set([cons(qs3)]))
      }
    }

    return key
  }

  const start = cons(new Set([start1]))
  // finish1.keys()'s length is `1` because it is processed by `appendEnd`.
  const finish = new Map([[symbolListKey(new Set(finish1.keys())), new Set([name])]])

  return {name, delta, start, finish, newChar}
}

module.exports = toDFAForRemain
