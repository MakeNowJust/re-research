'use strict'

const symbolDescriptionPattern = /^Symbol\((.*)\)$/

const symbolDescription = symbol => symbol.toString().match(symbolDescriptionPattern)[1]

module.exports = symbolDescription
