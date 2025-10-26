import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Helper function to resolve the current directory
const __dirname = path.resolve();

let db; // Hold the initialized Firestore instance

export function getFirestoreInstance() {
    if (!db) {
        throw new Error("Firestore has not been initialized. Call initFirebaseAdmin first.");
    }
    return db;
}

export default function initFirebaseAdmin() {
    try {
        if (admin.apps.length === 0) {
            
            let serviceAccount;
            let source = '';
            
            // Define the expected path relative to the project root where the key *should* be
            // The path reported in the error was: C:\Users\hsgpi\OneDrive\Desktop\ParkSense\parksense-backend\serviceAccountKey.json
            // We adjust this path to be robust. 
            // We assume __dirname is the project root (ParkSense), so we look inside the parksense-backend folder.
            const expectedBackendPath = path.join(__dirname, 'parksense-backend');
            const serviceAccountPath = path.join(expectedBackendPath, 'serviceAccountKey.json');


            // 1. Check for the Environment Variable (PREFERRED METHOD for production)
            const envJson = process.env.FIREBASE_CREDENTIALS_JSON;
            if (envJson) {
                // Parse the JSON content from the environment variable
                serviceAccount = JSON.parse(envJson);
                source = 'from environment variable';
            } 
            
            // 2. Fallback to Disk File (ONLY for local development)
            else {
                // Use the corrected path: C:\...\ParkSense\parksense-backend\serviceAccountKey.json
                if (!fs.existsSync(serviceAccountPath)) {
                    throw new Error(`Service Account file not found at: ${serviceAccountPath} and FIREBASE_CREDENTIALS_JSON is not set.`);
                }
                const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
                serviceAccount = JSON.parse(serviceAccountContent);
                source = 'from disk';
            }

            const projectId = serviceAccount.project_id;

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: projectId 
            });

            db = admin.app().firestore();

            console.log(`SUCCESS: Initialized Firebase Admin with explicit project ID ${source}.`);
        }
    } catch (error) {
        console.error('ERROR: Failed to initialize Firebase Admin SDK.');
        console.error('Ensure the credential source is correct.');
        console.error(error.message);
    }
}
