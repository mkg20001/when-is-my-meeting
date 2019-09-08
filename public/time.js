'use strict'

const acomp = require('acomp')

acomp.create(acomp.inputModel.TimeSimple12And24(), acomp.inputController.TextFieldJquery('#time'))
acomp.create(acomp.inputModel.DateDDMMYYYY({currentCentury: true}), acomp.inputController.TextFieldJquery('#date'))
