// Legacy endpoint kept so existing Netlify webhook URLs keep working.
// All notification logic lives in notify.cjs.
module.exports = require('./notify.cjs');
