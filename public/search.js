'use strict'

// https://fusejs.io/
const Fuse = require('fuse.js')
// https://momentjs.com/

const list = [
  {
    country: 'Germany',
    countryLocal: 'Deutschland',
    capital: 'Berlin',
    capitalLocal: 'Berlin',
    timezone: 'Europe/Berlin'
  }
]

const options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'country',
    'countryLocal',
    'capital',
    'timezone'
  ]
}

const search = new Fuse(list, options)
var result = search.search('ger')

console.log(result)
