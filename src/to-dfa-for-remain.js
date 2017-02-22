'use strict'

const {EPSILON} = require(`./consts`)
const pow = require(`./util/set-pow`)
const subsetEq = require(`./util/set-subset-eq`)
const symbolListKeyFactory = require(`./util/symbol-list-key`)
const symbolDescription = require(`./util/symbol-description`)

const toDFAForRemain = (newSymbol, sigma, look, {name, delta: delta1, start: start1, finish: finish1}) => {
  const symbolListKey = symbolListKeyFactory(newSymbol, symbolDescription(name))

  const lookSet = new Set([...look.ahead.keys(), ...look.behind.keys()])
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
  const finish = new Map

  const follow = (q, visiting, qs, conds, next) => {
    if (visiting.has(q)) return
    visiting.add(q)

    if (finish1.has(q)) qs.add(q)

    for (const [c, tos1] of delta1.get(q) || new Map) {
      if (c === EPSILON)
        for (const q1 of tos1) follow(q1, visiting, qs, conds, next)
      else if (lookSet.has(c))
        for (const q1 of tos1) follow(q1, visiting, new Set(conds.size === 0 ? [] : qs), new Set(conds).add(c), next)
      else next.push([c, conds, new Set([...(conds.size === 0 ? [] : qs), ...tos1])])
    }

    visiting.delete(q)
  }

  const cons = (qs) => {
    const next = []
    const visiting = new Set
    const conds = new Set
    for (const q of qs) follow(q, visiting, qs, conds, next)

    const key = symbolListKey(qs)
    if (delta.has(key)) return key
    const trans = new Map
    delta.set(key, trans)

    const done = new Set
    for (const q of qs)
      for (const name of finish1.get(q) || []) done.add(name)
    if (done.size > 0) finish.set(key, done)

    for (const c of sigma) {
      for (const conds of lookPowSet) {
        const qs2 = new Set
        let found = false
        for (const [c3, conds3, tos3] of next) {
          if (c === c3 && subsetEq(conds3, conds)) {
            found = true
            for (const q of tos3) qs2.add(q)
          }
        }
        if (found && qs2.size !== 0)
          trans.set(newChar(c, conds), new Set([cons(qs2)]))
      }
    }

    return key
  }

  const start = cons(new Set([start1]))

  return {name, delta, start, finish, newChar}
}

module.exports = toDFAForRemain
