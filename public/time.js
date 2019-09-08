'use strict'

const $ = require('jquery')

function hookField (id, allowKey) {
  id = `#${id}`

  $(id).on('keydown', (e) => {
    const val = $(id).val()

    if (e.originalEvent.keyCode >= 32 && e.originalEvent.keyCode <= 127) {
      const isAllowed = allowKey(val, val.substr(-1), e.originalEvent.key, (v) => $(id).val(v))
      if (!isAllowed) {
        e.preventDefault()
      }
    }
  })
}

// TODO: handle backspace
hookField('time', (val, lastKey, key, chVal) => {
  /* Time */

  if (!val.length) {
    return key.match(/^[0-2]$/)
  }

  if (val.length === 1) {
    return key.match(/^[0-9:]$/)
  }

  if (val.length === 2 || val.length === 3 || val.length === 4) {
    if (val.indexOf(':') === -1) {
      return key.match(/^[:]$/)
    } else if (lastKey === ':') {
      if (val.length === 2) {
        chVal('0' + val)
      }
      return key.match(/^[0-5]$/)
    } else {
      return key.match(/^[0-9]$/)
    }
  }

  /* Now we have exactly 5 digits, so am/pm */

  // TODO: start processing

  if (val.length >= 5) {
    if (val.length === 5) {
      return key.match(/^[ap ]$/i)
    } else if (lastKey === ' ') {
      return key.match(/^[ap]$/i)
    } else if (lastKey.toLowerCase() === 'a' || lastKey.toLowerCase() === 'p') {
      if (val.indexOf(' ') === -1) {
        chVal(val.substr(0, 5) + ' ' + val.substr(5))
      }
      return key.match(/^[m]$/i)
    } else if (lastKey === 'm') {

    }
  }
})
