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
    let val = $(id).val().split('')

    let pos = $(id).caret()

    debug(e)

    e.preventDefault()

    if (e.which) {
      let stack = [String.fromCharCode(e.originalEvent.charCode)]

      while (stack.length) {
        debug(stack)
        let key = stack.shift()

        const res = allowKey(val, pos, val[pos - 1], key)
        debug(res, {val, pos, lastKey: val[pos - 1], key})

        if (!res) {
          if (stack.length) {
            console.error('Stack trash %s', val)
          }
        } else {
          const {prevChar, curChar, pushStack} = res

          if (prevChar) {
            if (!pos) { // eslint-disable-line
              pos++
              val.unshift(prevChar)
            } else {
              val[pos - 1] = prevChar
            }
          }

          if (curChar) {
            val[pos] = curChar
          }

          if (stack.length && pushStack) {
            console.error('Pushing stack with existing queue. Mixed behaviour!')
          }

          if (pushStack) {
            stack = pushStack.split('')
          }

          pos++
        }
      }

      $(id).val(val.join(''))
      $(id).caret(pos)
    }
  })
}

// TODO: handle backspace
hookField('time', (val, pos, lastKey, key) => { // eslint-disable-line complexity
  /* Time */

  // rule of thumb: push to stack if the field is after the current

  switch (pos) {
    // 1
    case 0: { // first key must be a number
      if (key.match(/^[0-9]$/)) {
        return {curChar: key}
      } else {
        return false
      }
    }
    // 12
    case 1: { // second key must be (together with the first) a number smaller than 23
      if (key.match(/^[0-9]$/)) {
        let total = parseInt(lastKey + key, 10)

        if (total === 24) {
          return {allow: true, prevChar: '0', curChar: '0', nextChar: ':'}
        } else if (total > 24) {
          return {prevChar: '0', curChar: lastKey, pushStack: ':' + key}
        } else {
          return {curChar: key, pushStack: ':'}
        }
      } else if (key === ':' || key === ' ') {
        return {prevChar: '0', curChar: lastKey, pushStack: ':'}
      } else {
        return false
      }
    }
    // 12:
    case 2: {
      return key === ':' ? {curChar: key} : false
    }
    // 12:3
    case 3: { // this can either be a 0-5 for 59 for ex, or 6-9 for 09
      if (key.match(/^[0-5]$/)) {
        return {curChar: key}
      } else if (key.match(/^[6-9]$/)) {
        return {curChar: '0', pushStack: key}
      } else {
        return false
      }
    }
    // 12:33
    case 4: { // this can be any number
      if (key.match(/^[0-9]$/)) {
        return {curChar: key, pushStack: ' '}
      } else {
        return false
      }
    }
    case 5: { // this can be a space
      return key === ' ' ? {curChar: key, pushStack: parseInt(val.slice(0, 2).join(''), 10) > 12 ? 'p' : ''} : false
    }
    case 6: { // this can be an a or p
      const hour = parseInt(val.slice(0, 2).join(''), 10)
      key = key.toLowerCase()
      if ((hour <= 12 && key.match(/^[ap]$/)) || (hour > 12 && key === 'p')) {
        return {curChar: key, pushStack: 'm'}
      } else {
        return false
      }
    }
    case 7: { // this can be an m
      return key.toLowerCase() === 'm' ? {curChar: 'm'} : false
    }
    default: { // out of bounds
      return {allow: undefined}
    }
  }
})
