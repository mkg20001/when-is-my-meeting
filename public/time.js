'use strict'

const $ = require('jquery')

function hookField (id, allowKey) {
  id = `#${id}`

  $(id).on('keydown', (e) => {
    const val = $(id).val()

    if (e.originalEvent.keyCode >= 32 && e.originalEvent.keyCode <= 127) {
      const isAllowed = allowKey(val, val.length, val.substr(-1), e.originalEvent.key, (v) => $(id).val(v))
      if (!isAllowed) {
        e.preventDefault()
      }
    }
  })
}

// TODO: handle backspace
hookField('time', (val, pos, lastKey, key, chVal) => { // eslint-disable-line complexity
  /* Time */

  switch (pos) {
    // 1
    case 0: { // first key must be a number
      return key.match(/^[0-9]$/)
    }
    // 12
    case 1: { // second key must be (together with the first) a number smaller than 23
      if (key.match(/^[0-9]$/)) {
        let total = parseInt(lastKey + key, 10)

        if (total > 23) {
          if (total === 24) {
            chVal('00:')
          }

          return false
        } else {
          chVal(lastKey + key + ':') // auto-add :
          return false
        }
      } else if (key === ':') {
        chVal('0' + val + key)
        return false
      } else {
        return false
      }
    }
    // 12:
    case 2: {
      chVal(val + ':')
      return false
    }
    // 12:3
    case 3: { // this can either be a 0-5 for 59 for ex, or 6-9 for 09
      if (key.match(/^[0-5]$/)) {
        return true
      } else if (key.match(/^[6-9]$/)) {
        chVal(val + '0' + key)
        return false
      } else {
        return false
      }
    }
    // 12:33
    case 4: { // this can be any number
      if (key.match(/^[0-9]$/)) {
        chVal(val + key + ' ')
      }
      return false
    }
    case 5: { // this can be a space
      return key === ' '
    }
    case 6: { // this can be an a or p
      if (key.match(/^[ap]$/i)) {
        chVal(val + key + 'm')
      }
      return false
    }
    case 7: { // this can be an m
      return key.match(/^[m]$/i)
    }
    default: {
      console.error('Out of bounds')
    }
  }

  /* if (val.length > 3) {
    if (!val.length) {
    }

    if (val)
  }

  if (val.length < 5) {
    if (key.indexOf(':') === -1) {
      if (val.length === 2 && key !== ':') {
        chVal(val + ':')
      }

      if (val.length) {
        if (key.match(/^[0-9]$/)) { // times like 93 are invalid
          if (parseInt(lastKey, 10) > 2) { // eslint-disable-line
            return false
          }

          // times like 23 are invalid as well, 24 as a special case gets set to 00
          if (parseInt(lastKey + key, 10) > 23) { // eslint-disable-line
            if (parseInt(lastKey + key, 10) === 24) { // eslint-disable-line
              chVal('00:')
            }
            return false
          }
        }

        return key.match(/^[0-9:]$/)
      }

      if (!val.length) {
        return key.match(/^[0-9]$/)
      }
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
  } */

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
      // do nothing
    }
  }
})
