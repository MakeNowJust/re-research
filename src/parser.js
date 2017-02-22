'use strict'

// fromNodes crates a new node from *nodes* list.
const fromNodes = (type, nodes) => {
  switch (nodes.length) {
    case 0:
      return {type: `empty`}
    case 1:
      return nodes[0]
    default:
      return {type, nodes}
  }
}

// Special characters to stop "concat" parsing.
//
// NOTE: `undefined` means EOF.
const stopConcat = new Set([undefined, `|`, `)`])

// Parser of Regular Expression.
class Parser {
  constructor(source) {
    this.source = source
    this.offset = 0
  }

  get current() {
    return this.source[this.offset]
  }

  next(n = 1) {
    this.offset += n
  }

  match(test) {
    return this.source.slice(this.offset).startsWith(test)
  }

  consume(test) {
    if (this.match(test)) {
      this.next(test.length)
      return true
    }
    return false
  }

  expect(test, message) {
    if (this.consume(test)) return true
    throw new Error(message)
  }

  unexpect(test, message) {
    if (this.match(test)) throw new Error(message)
  }

  // ```
  // root = alt EOF
  // ```
  parse() {
    const root = this.parseAlt()

    if (this.source.length !== this.offset)
      throw new Error(`Unexpected character: ${this.current}`)

    return root
  }

  // ```
  // alt = concat ('|' concat)*
  // ```
  parseAlt() {
    const nodes = []

    nodes.push(this.parseConcat())
    while (this.consume(`|`))
      nodes.push(this.parseConcat())

    return fromNodes(`alt`, nodes)
  }

  // ```
  // concat = (!(EOF | '|' | ')') condition)*
  // ```
  parseConcat() {
    const nodes = []

    while (!stopConcat.has(this.current))
      nodes.push(this.parseCondition())

    return fromNodes(`concat`, nodes)
  }

  // ```
  // condition =
  //   '(?=' alt ')' | '(?!' alt ')' |
  //   '(?<=' alt ')' | '(?<!' alt ')' |
  //   repeat
  // ```
  parseCondition() {
    if (this.consume(`(?=`)) {
      const node = this.parseAlt()
      this.expect(`)`, `unterminated group`)
      return {type: `positive-look-ahead`, node}
    }

    if (this.consume(`(?!`)) {
      const node = this.parseAlt()
      this.expect(`)`, `unterminated group`)
      return {type: `negative-look-ahead`, node}
    }

    if (this.consume(`(?<=`)) {
      const node = this.parseAlt()
      this.expect(`)`, `unterminated group`)
      return {type: `positive-look-behind`, node}
    }

    if (this.consume(`(?<!`)) {
      const node = this.parseAlt()
      this.expect(`)`, `unterminated group`)
      return {type: `negative-look-behind`, node}
    }

    return this.parseRepeat()
  }

  // ```
  // repeat = atom ('?' | '*' | '+')?
  // ```
  parseRepeat() {
    const node = this.parseAtom()

    if (this.consume(`?`))
      return {type: `optional`, node}

    if (this.consume(`*`))
      return {type: `many`, node}

    if (this.consume(`+`))
      return {type: `some`, node}

    return node
  }

  // ```
  // atom = !(')' | '?' | '*' | '+') ('(' alt ')' | '.' | .)
  // ```
  parseAtom() {
    this.unexpect(`)`, `unmatched ')'`)
    this.unexpect(`?`, `nothing to repeat`)
    this.unexpect(`*`, `nothing to repeat`)
    this.unexpect(`+`, `nothing to repeat`)

    if (this.consume(`(`)) {
      const node = this.parseAlt()
      this.expect(`)`, `unterminated group`)
      return node
    }

    if (this.consume(`.`)) return {type: `any`}

    const value = this.current
    this.next()
    return {type: `char`, value}
  }
}

module.exports = Parser
