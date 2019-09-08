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
hookField('time', (val, lastKey, key, chVal) => { // eslint-disable-line complexity
  /* Time */

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
      // do nothing
    }
  }
})
