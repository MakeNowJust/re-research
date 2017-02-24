'use strict'

const {EPSILON} = require(`./consts`)

// runNFA runs NFA matching.
const runNFA = (string, {delta, start, finish}) => {
  const step = (q, offset, next) => {
    if (!delta.has(q)) return

    const trans = delta.get(q)
    const c = string[offset]

    if (trans.has(c)) {
      for (const q of trans.get(c)) next.push({q, offset: offset + 1})
    }
    if (trans.has(EPSILON)) {
      for (const q of trans.get(EPSILON)) next.push({q, offset})
    }
  }

  const result = []
  let threads = [{q: start, offset: 0}]
  while (threads.length > 0) {
    const next = []
    for (const {q, offset} of threads) {
      result[offset] = result[offset] || new Set
      if (finish.has(q))
        for (const name of finish.get(q)) result[offset].add(name)
      step(q, offset, next)
    }
    threads = next
  }

  return result
}

module.exports = runNFA
