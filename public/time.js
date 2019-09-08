'use strict'

const $ = window.jQuery = require('jquery')
require('@accursoft/jquery-caret')

const debug = console.log.bind(console)

function hookField (id, allowKey) {
  id = `#${id}`

  $(id).on('keydown', (e) => {
    let val = $(id).val().split('')

    const pos = $(id).caret()

    debug(e)

    if (pos && e.originalEvent.code === 'Backspace') {
      e.preventDefault()
      if (typeof val[pos] === 'string') {
        val[pos - 1] = '░' // remove current value
      } else {
        delete val[pos - 1]
      }
      $(id).val(val.join('')) // set value
      $(id).caret(pos - 1) // move caret one back
    }

    if (typeof val[pos + 1] === 'string' && e.originalEvent.code === 'Delete') { // if next thing is string and user presses delete, delete next char
      e.preventDefault()
      if (typeof val[pos + 1] === 'string') {
        val[pos] = '░' // remove current value
      } else {
        delete val[pos]
      }
      $(id).val(val.join('')) // set value
      $(id).caret(pos + 1) // move caret one back
    }
  })

  $(id).on('keypress', (e) => {
    let val = $(id).val()

    let pos = $(id).caret()

    debug(e)
    if (e.which) {
      const key = String.fromCharCode(e.originalEvent.charCode)
      debug(allowKey(val, pos, val[pos - 1], key), {val, pos, lastKey: val[pos - 1], key})
      const {allow, prevPrevChar, prevChar, curChar, nextChar} = allowKey(val, pos, val[pos - 1], e.originalEvent.key)

      e.preventDefault()
      if (!allow) {
        return
      }

      val = val.split('')
      debug(val)

      /* let isNextUserChar = val[pos + 1]

      if (typeof isNextUserChar === 'string') { // make space for current entry
        val = val.slice(0, pos).concat([null]).concat(val.slice(pos))
      } */

      let offset = 1

      if (prevPrevChar) {
        if (pos - 2 < 0) {
          pos++
          val.unshift(prevPrevChar)
        } else {
          val[pos - 2] = prevPrevChar
        }
      }
      if (prevChar) {
        if (pos - 1 < 0) {
          pos++
          val.unshift(prevChar)
        } else {
          val[pos - 1] = prevChar
        }
      }
      val[pos] = curChar || key
      if (nextChar) {
        val[pos + 1] = nextChar
        offset++
      }
      debug(val)

      $(id).val(val.join(''))
      $(id).caret(pos + offset)
    }
  })
}

// TODO: handle backspace
hookField('time', (val, pos, lastKey, key) => { // eslint-disable-line complexity
  /* Time */

  switch (pos) {
    // 1
    case 0: { // first key must be a number
      return {allow: key.match(/^[0-9]$/)}
    }
    // 12
    case 1: { // second key must be (together with the first) a number smaller than 23
      if (key.match(/^[0-9]$/)) {
        let total = parseInt(lastKey + key, 10)

        if (total === 24) {
          return {allow: true, prevChar: '0', curChar: '0', nextChar: ':'}
        } else if (total > 24) {
          return {allow: true, prevPrevChar: '0', prevChar: lastKey, curChar: ':', nextChar: key}
        } else {
          return {allow: true, nextChar: ':'}
        }
      } else if (key === ':' && key === ' ') { // FEATURE: you can press space to set the middle sepeartor
        return {allow: true, prevChar: '0', curChar: lastKey, nextChar: ':'}
      } else {
        return {allow: false}
      }
    }
    // 12:
    case 2: {
      return {allow: key === ':'}
    }
    // 12:3
    case 3: { // this can either be a 0-5 for 59 for ex, or 6-9 for 09
      if (key.match(/^[0-5]$/)) {
        return {allow: true}
      } else if (key.match(/^[6-9]$/)) {
        return {allow: true, curChar: '0', nextChar: key}
      } else {
        return {allow: false}
      }
    }
    // 12:33
    case 4: { // this can be any number
      if (key.match(/^[0-9]$/)) {
        return {allow: true, nextChar: ' '}
      }
      return {allow: false}
    }
    case 5: { // this can be a space
      return {allow: key === ' '}
    }
    case 6: { // this can be an a or p
      if (key.match(/^[ap]$/i)) {
        return {allow: true, curChar: key.toLowerCase(), nextChar: 'm'}
      }
      return {allow: false}
    }
    case 7: { // this can be an m
      return {allow: key.match(/^[m]$/i), curChar: key.toLowerCase()}
    }
    default: { // out of bounds
      return {allow: undefined}
    }
  }
})
