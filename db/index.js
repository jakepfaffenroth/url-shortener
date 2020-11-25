require('dotenv').config();

const initOptions = {
  // pg-promise initialization options...

  receive(data, result, e) {
    camelizeColumns(data);
    // console.log('Query executed:', { query: e.query, duration: result.duration + ' ms', rows: result.rowCount });
  },
  error(err, e) {
    monitor.error(err, e);

    if (e.cn) {
      // this is a connection-related error
      // cn = safe connection details passed into the library:
      //      if password is present, it is masked by #
      // console.log('DB connection error:', { cn: e.cn, err });
    }

    if (e.query) {
      // // query string is available
      // console.info('DB query error:', {
      //   query: e.query,
      //   msg: err.message,
      //   received: err.received,
      //   stack: err.stack
      //   // duration: err.result.duration + ' ms',
      // });
    }

    if (e.ctx) {
      // occurred inside a task or transaction
      // console.log('DB task/tx error:', { ctx: e.ctx, err });
    }

  },
};
console.log('process.env.PG_CON_STRING:', process.env.PG_CON_STRING);
const pgp = require('pg-promise')(initOptions);
const cn = process.env.PG_CON_STRING;
const monitor = require('pg-monitor');

// SQL column names are snake_case -- convert to camelCase
function camelizeColumns(data) {
  const tmp = data[0];
  for (const prop in tmp) {
    const camel = pgp.utils.camelize(prop);
    if (!(camel in tmp)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
}

monitor.attach(initOptions);
monitor.setTheme('dimmed');

module.exports.pgpHelpers = pgp.helpers
module.exports.pgPromise = pgp(cn);
