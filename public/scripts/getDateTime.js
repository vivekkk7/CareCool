const moment = require('moment');

// Current date in dd-mm-yyyy format
const currentDate = moment().format('DD-MM-YYYY');
console.log(currentDate);

// Current time in hh-mm-ss format
const currentTime = moment().format('HH:mm:ss');
console.log(currentTime);
