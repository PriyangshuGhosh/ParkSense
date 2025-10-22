// Simple structured logger used by the server
const LEVEL = process.env.LOG_LEVEL || 'info';

function log(level, message, meta) {
  const levels = ['error', 'warn', 'info', 'debug'];
  if (levels.indexOf(level) <= levels.indexOf(LEVEL)) {
    const out = { level, message, ts: new Date().toISOString(), ...meta };
    if (level === 'error') console.error(JSON.stringify(out)); else console.log(JSON.stringify(out));
  }
}

export default {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta)
};
