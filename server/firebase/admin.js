const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  let serviceAccount = null;

  // Priority:
  // 1) FIREBASE_SERVICE_ACCOUNT (JSON string)
  // 2) FIREBASE_SERVICE_ACCOUNT_PATH (file path)
  // 3) ADC (Application Default Credentials)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
      throw err;
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  }

  const initOptions = serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {};
  admin.initializeApp(initOptions);
}

const db = admin.firestore();

module.exports = { admin, db };