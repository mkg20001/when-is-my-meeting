'use strict'

const $ = window.jQuery = require('jquery')
require('@accursoft/jquery-caret')

const debug = console.log.bind(console)

function hookField (id, allowKey) {
  id = `#${id}`

  $(id).on('keydown', (e) => {
    let val = $(id).val()

    const pos = $(id).caret()

    if (e.originalEvent.keyCode >= 32 && e.originalEvent.keyCode <= 127) {
      debug(allowKey(val, pos, val[pos - 1], e.originalEvent.key), {val, pos, lastKey: val[pos - 1], key: e.originalEvent.key})
      const {allow, prevChar, curChar, nextChar} = allowKey(val, pos, val[pos - 1], e.originalEvent.key)

      e.preventDefault()
      if (!allow) {
        return
      }

      val = val.split('')
      debug(val)

      if (prevChar) {
        val[pos - 1] = prevChar
      }
      val[pos] = curChar || e.originalEvent.key
      if (nextChar) {
        val[pos + 1] = nextChar
        $(id).caret(pos + 1)
      }
      debug(val)

      $(id).val(val.join(''))
    }
  })
}

// TODO: handle backspace
hookField('time', (val, pos, lastKey, key, apVal) => { // eslint-disable-line complexity
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

        if (total > 23) {
          if (total === 24) {
            return {allow: true, prevChar: '0', curChar: '0', nextChar: ':'}
          }

          return {allow: false}
        } else {
          return {allow: true, nextChar: ':'}
        }
      } else if (key === ':') {
        return {allow: true, prevChar: '0', curChar: lastKey, nextChar: key}
      } else {
        return {allow: false}
      }
    }
    // 12:
    case 2: {
      return {allow: true, nextChar: ':'}
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
        return {allow: true, nextChar: 'm'}
      }
      return {allow: false}
    }
    case 7: { // this can be an m
      return {allow: key.match(/^[m]$/i)}
    }
    default: { // out of bounds
      return {allow: undefined}
    }
  }
})
