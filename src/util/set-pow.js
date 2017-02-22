'use strict'

const pow = set => {
  const arr = Array.from(set)
  const powSet = new Set

  const loop = (item, last) => {
    powSet.add(item)

    for (let i = last; i < arr.length; i++)
      loop(new Set(item).add(arr[i]), i + 1)

    return powSet
  }

  return loop(new Set, 0)
}

module.exports = pow
