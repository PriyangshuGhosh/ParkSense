// parksense-backend/src/firebaseAdmin.js

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Helper function to resolve the current working directory relative to the process start
const PROJECT_ROOT = path.resolve('./');

let db; // Hold the initialized Firestore instance

export function getFirestoreInstance() {
    if (!db) {
        // This will only be called if initFirebaseAdmin succeeded earlier
        throw new Error("Firestore has not been initialized. Call initFirebaseAdmin first.");
    }
    return db;
}

export default function initFirebaseAdmin() {
    try {
        if (admin.apps.length === 0) {
            
            let serviceAccount;
            let source = '';
            
            // --- CRITICAL PATH CORRECTION ---
            // Assumes 'serviceAccountKey.json' is located directly in the 'parksense-backend' folder (the current working directory).
            const serviceAccountPath = path.join(PROJECT_ROOT, 'serviceAccountKey.json');
            // ------------------------------------

            // 1. Check for the Environment Variable (PREFERRED METHOD for production)
            const envJson = process.env.FIREBASE_CREDENTIALS_JSON;
            if (envJson) {
                // Parse the JSON content from the environment variable
                serviceAccount = JSON.parse(envJson);
                source = 'from environment variable';
            } 
            
            // 2. Fallback to Disk File (ONLY for local development)
            else {
                // Use the corrected path
                if (!fs.existsSync(serviceAccountPath)) {
                    // 🛑 NEW CHECK: Throw a precise error if no credentials were found at all
                    throw new Error(`CRITICAL ERROR: No Service Account credentials found. Check FIREBASE_CREDENTIALS_JSON env var and ${serviceAccountPath} file.`);
                }
                const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
                serviceAccount = JSON.parse(serviceAccountContent);
                source = 'from disk';
            }

            const projectId = serviceAccount.project_id;
            
            // 🛑 NEW LOGGING 🛑
            console.log(`[INIT] Attempting Firebase Admin initialization. Source: ${source}. Project ID: ${projectId}.`);


            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: projectId 
            });

            db = admin.app().firestore();

            // 🛑 UPDATED SUCCESS LOG 🛑
            console.log(`[SUCCESS] Firebase Admin SDK fully initialized for project ${projectId}.`);
        }
        // If an app already exists, just return the admin instance
        return admin;
    } catch (error) {
        // Only log the error once if initialization fails
        if (admin.apps.length === 0 || !db) {
            console.error('\n\n🛑 ERROR: Failed to initialize Firebase Admin SDK. 🛑');
            console.error('Ensure the credential source (env var or file) is correct and the JSON content is valid.');
            console.error('Failure Message:', error.message);
            console.error('\n');
        }
        // Throwing prevents the app from starting with bad config
        throw error;
    }
}
