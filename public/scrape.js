'use strict'

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const jQuery = require('jquery')

// go to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// paste this:

async function main () {
  let document
  let $

  document = await JSDOM.fromURL('https://en.wikipedia.org/wiki/List_of_tz_database_time_zones')
  $ = jQuery(document.window)

  const tzDB = $($('table')[0]).find('tr').toArray().slice(1).map(e => {
    e = $(e)
    let td = e.find('td').toArray().map(e => $(e))
    return {
      countryCode: td[0].text().trim() || null,
      dbName: td[2].text().trim() || null,
      status: td[4].text().trim() || null,
      utcOffset: td[5].text().trim() || null,
      utcDstOffset: td[6].text().trim() || null
    }
  }).filter(e => e.status !== 'Deprecated')

  document = await JSDOM.fromURL('https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes')
  $ = jQuery(document.window)

  const langDB = $($('table')[1]).find('tr').toArray().slice(1).map(e => {
    e = $(e)
    let td = e.find('td').toArray().map(e => $(e))
    return {
      langEn: td[2].text().trim() || null,
      langLocal: td[3].text().trim() || null,
      code: td[4].text().trim() || null
    }
  })

  document = await JSDOM.fromURL('https://en.wikipedia.org/wiki/ISO_3166-1')
  $ = jQuery(document.window)

  const isoDB = $($('table')[1]).find('tr').toArray().slice(1).map(e => {
    e = $(e)
    let td = e.find('td').toArray().map(e => $(e))
    return {
      name: td[0].text().trim() || null,
      code: td[1].text().trim() || null
    }
  })

  const isoResolve = isoDB.reduce((obj, entry) => {
    obj[entry.code] = entry.name
    return obj
  }, {})

  const out = tzDB.map((entry) => {
    const out = {
      countryCode: entry.countryCode,
      country: isoResolve[entry.countryCode],
      timezone: entry.dbName
    }

    if (entry.dbName.indexOf('/') !== -1) {
      let [continent, capitol] = entry.dbName.split('/')
      out.continent = continent
      out.capitol = capitol.replace(/_/g, ' ')
    }

    for (const key in out) {
      if (!out[key]) delete out[key]
    }

    return out
  })

  require('fs').writeFileSync('./db.json', JSON.stringify(out))
}

/*

{
  country: 'Germany',
  countryCode: 'DE',
  // countryLocal: 'Deutschland',
  capitol: 'Berlin',
  // capitolLocal: 'Berlin',
  timezone: 'Europe/Berlin'
}

*/

main().then(console.log, console.rror)
