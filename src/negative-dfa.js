'use strict'

const negativeNFA = ({name, delta, start, finish: finish1}) => {
  const finish = new Map()

  for (const [from, trans] of delta) {
    if (!finish1.has(from) && !finish.has(from)) finish.set(from, new Set([name]))
    for (const [, tos] of trans) {
      for (const to of tos)
        if (!finish1.has(to) && !finish.has(from)) finish.set(to, new Set([name]))

    }
  }

  return {name, delta, start, finish}
}

module.exports = negativeNFA
