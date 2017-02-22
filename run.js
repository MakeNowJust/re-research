#!/usr/bin/env node

/* eslint-disable no-console */

'use strict'

const {execSync} = require(`child_process`)
const util = require(`util`)

const Parser = require(`./src/parser`)
const appendDotStar = require(`./src/append-dot-star`)
const appendEnd = require(`./src/append-end`)
// const collectSigma = require(`./src/collect-sigma`)
const concat = require(`./src/util/generator-concat`)
const crossNFA = require(`./src/cross-nfa`)
const extractCondition = require(`./src/extract-condition`)
const newSymbolFactory = require(`./src/util/new-symbol`)
const removeUnreachable = require(`./src/remove-unreachable`)
const reverseNFA = require(`./src/reverse-nfa`)
const runNFA = require(`./src/run-nfa`)
const symbolDescription = require(`./src/util/symbol-description`)
const toDFA = require(`./src/to-dfa`)
const toDFAForRemain = require(`./src/to-dfa-for-remain`)
const toDOT = require(`./src/to-dot`)
const toNFA = require(`./src/to-nfa`)

util.inspect.defaultOptions.depth = null

const dot = (name, graph) => {
  console.log(`create output/${name}.png`)
  execSync(`dot -Tpng -ooutput/${name}.png`, {input: toDOT(graph, x => symbolDescription(x))})
}

const text = `helloworld`
const pattern = `(?=h.*o).*(?<=w.*d)`

console.log(`text:`, text)
console.log(`pattern:`, pattern)

const rawRoot = new Parser(pattern).parse()
const sigma = new Set(text)
const {root, look} = extractCondition(rawRoot)
const nfa = toNFA(Symbol(`main`), sigma, root)

const newSymbolAhead = newSymbolFactory()
const aheadNFAtmp = look.ahead.size > 0 && Array.from(look.ahead)
  .map(([name, re]) => toNFA(name, sigma, re.node))
  .map(reverseNFA)
const newSymbolBehind = newSymbolFactory()
const behindNFAtmp = look.behind.size > 0 && Array.from(look.behind)
  .map(([name, re]) => toNFA(name, sigma, re.node))

let endNFA = appendEnd(sigma, nfa)
dot(`nfa`, endNFA)
const dfa = toDFAForRemain(newSymbolFactory(), sigma, look, endNFA)
dot(`dfa`, dfa)

const aheadNFA = aheadNFAtmp && aheadNFAtmp
  .map(nfa => appendDotStar(sigma, nfa))
  .reduce((cross, nfa) => removeUnreachable(sigma, crossNFA(newSymbolAhead, sigma, cross, nfa)))
const aheadDFA = aheadNFA ? toDFA(newSymbolAhead, aheadNFA) : null
const behindNFA = behindNFAtmp && behindNFAtmp
  .map(nfa => appendDotStar(sigma, nfa))
  .reduce((cross, nfa) => removeUnreachable(sigma, crossNFA(newSymbolBehind, sigma, cross, nfa)))
const behindDFA = behindNFA ? toDFA(newSymbolBehind, behindNFA) : null

if (aheadDFA) {
  dot(`ahead-nfa`, aheadNFA)
  dot(`ahead-dfa`, aheadDFA)
}
if (behindNFA) {
  dot(`behind-nfa`, behindNFA)
  dot(`behind-dfa`, behindDFA)
}

const input = text.split(``).concat(sigma.end)

const aheads = aheadDFA ? runNFA(input.concat().reverse(), aheadDFA).reverse() : []
const behinds = behindDFA ? runNFA(input, behindDFA) : []

const newInput = input.map((c, i) => dfa.newChar(c, new Set(concat(aheads[i], behinds[i]))))

const result = runNFA(newInput, dfa)
console.log(`match:`)
for (const [i, set] of result.entries())
  if (set.size !== 0) console.log([0, i - 1], text.slice(0, i - 1))
