'use strict'

// https://fusejs.io/
const Fuse = require('fuse.js')
// https://momentjs.com/
const moment = require('moment')

const $ = require('jquery')

const list = require('./db.json')

const options = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'countryCode',
    'country',
    'timezone',
    'continent',
    'capitol'
  ]
}

const search = new Fuse(list, options)

const translatedNames = {
  countryCode: 'Country Code',
  country: 'Country',
  timezone: 'Timezone',
  continent: 'Continent',
  capitol: 'Capitol'
}

function createHighlighted (str, hi) {
  str = str.split('')
  hi.reverse().forEach(([start, end]) => {
    end++
    str = str.slice(0, start).concat(`<span class="hi">${str.slice(start, end).join('')}</span>`).concat(str.slice(end))
  })

  return str.join('')
}

function makeSearch (id) {
  id = `#${id}`

  const el = $('<div class="search-results"></div>')

  $(id).after(el)

  const doSearch = () => {
    const val = $(id).val()

    const res = search.search(val)

    if (val && val.length >= 2) {
      el.html(res.map(r => `
          <div class="search-result">
            <h3><b>${r.item.timezone}</b></h3>
            ${r.matches.map(({key, value, indices}) => `<b class="search-match">${translatedNames[key]}: ${createHighlighted(value, indices)}</b>`).join('')}
          </div>
          `).join(''))
    } else {
      el.html('')
    }
  }

  doSearch()

  $(id).on('keypress', () => {
    doSearch()
  })
  $(id).on('keyup', () => {
    doSearch()
  })
  $(id).on('change', () => {
    doSearch()
  })
}

makeSearch('srclocation')
makeSearch('dstlocation')
