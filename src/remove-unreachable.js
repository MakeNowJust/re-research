'use strict'

const {EPSILON} = require(`./consts`)
const concat = require(`./util/generator-concat`)

// `removeUnreachable` removes unreachable edges and nodes from NFA.
const removeUnreachable = (sigma, {name, delta: delta1, start, finish: finish1}) => {
  const delta = new Map
  const finish = new Map

  const visited = new Map
  const loop = from => {
    if (visited.has(from)) return visited.get(from)

    const trans1 = delta1.get(from) || new Map
    const trans = new Map

    let state = finish1.has(from) ? `finishable` : `unknown`
    visited.set(from, state)
    let empty = true
    for (const c of concat(sigma, [EPSILON])) {
      const next = []
      for (const to of trans1.get(c) || []) {
        empty = false
        switch (loop(to)) {
          case `finishable`:
            next.push(to)
            state = `finishable`
            break
          case `unknown`:
            next.push(to)
            break
        }
      }
      if (next.length !== 0) trans.set(c, next)
    }

    if (state === `unknown`) state = empty ? `not-finishable` : `unknown`

    if (state === `finishable` || state === `unknown`) {
      if (finish1.has(from)) finish.set(from, finish1.get(from))
      if (trans.size !== 0) delta.set(from, trans)
    }

    visited.set(from, state)

    return state
  }

  loop(start)

  return {name, delta, start, finish}
}

module.exports = removeUnreachable
