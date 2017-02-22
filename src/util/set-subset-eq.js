'use strict'

const subsetEq = (as, bs) => {
  for (const a of as)
    if (!bs.has(a)) return false
  return true
}

module.exports = subsetEq
