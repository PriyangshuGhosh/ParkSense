import admin from 'firebase-admin';
import fs from 'fs';

/**
 * Initializes the Firebase Admin SDK, checking for existing app instances
 * and attempting to load credentials from:
 * 1. FIREBASE_CREDENTIALS_JSON environment variable (Recommended for deployment).
 * 2. Service account JSON file path (Legacy/Local method).
 * 3. Default Application Credentials (ADC).
 * @returns {object} The initialized Firebase Admin instance.
 */
export default function initFirebaseAdmin(){
    // Check if the app is already initialized
    if (admin.apps && admin.apps.length) return admin;

    let credentialsLoaded = false;
    
    // 1. Try to load from FIREBASE_CREDENTIALS_JSON environment variable
    const credentialsJsonString = process.env.FIREBASE_CREDENTIALS_JSON;

    if (credentialsJsonString) {
        try {
            const serviceAccount = JSON.parse(credentialsJsonString);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            console.log('SUCCESS: Initialized Firebase Admin from FIREBASE_CREDENTIALS_JSON.');
            credentialsLoaded = true;
        } catch (e) {
            console.error('ERROR: Failed to parse FIREBASE_CREDENTIALS_JSON:', e.message);
        }
    }

    // 2. Fallback to Service Account File Path (Only if not already loaded)
    if (!credentialsLoaded) {
        const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
        
        if (fs.existsSync(keyPath)) {
            try {
                const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
                console.log('SUCCESS: Initialized Firebase Admin with service account file.');
                credentialsLoaded = true;
            } catch (e) {
                console.error('ERROR: Failed to parse or load service account key file:', e.message);
            }
        }
    }
    
    // 3. Fallback to Default Credentials (If all others failed)
    if (!credentialsLoaded) {
        console.warn('WARNING: No explicit Firebase credentials found. Initializing admin with default credentials (may fail for Firestore).');
        try { 
            admin.initializeApp(); 
            credentialsLoaded = true;
        } catch(e){ 
            console.warn('Firebase admin default init failed:', e.message); 
        }
    }
    
    return admin;
}
