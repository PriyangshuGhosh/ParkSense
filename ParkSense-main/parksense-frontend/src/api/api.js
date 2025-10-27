import { useAuth } from '../auth/AuthProvider'; 

// CRITICAL: Ensure this matches your backend's port and base route
const BASE_URL = 'http://localhost:5000/api'; 

/**
 * Custom hook to provide a fetch wrapper that automatically adds
 * the Firebase ID token for secure API calls.
 */
export function useSecureApi() {
    // Get the token from your custom AuthProvider hook
    const { token } = useAuth();

    // The signature (endpoint, method, body) is key!
    const secureFetch = async (endpoint, method = 'GET', body = null) => {
        if (!token) {
            throw new Error("Authentication required: Token is missing."); 
        }
        
        const headers = {
            'Content-Type': 'application/json',
            // CRITICAL: Send the token to the backend
            'Authorization': `Bearer ${token}` 
        };

        const config = {
            method, // <-- This correctly uses the second argument (which is now 'POST')
            headers,
            body: body ? JSON.stringify(body) : undefined, // <-- This correctly stringifies the third argument (bookingPayload)
        };

        const response = await fetch(`${BASE_URL}/${endpoint}`, config);

        if (response.status === 401) {
            // This is handled by AuthProvider typically, but a safety net for local API
            throw new Error("Unauthorized: Session invalid or expired.");
        }

        if (!response.ok) {
            // Handle other server errors
            const errorBody = await response.json().catch(() => ({ error: 'Server error' }));
            throw new Error(errorBody.error || `HTTP error! Status: ${response.status}`);
        }

        // Returns the full JSON body (e.g., { data: [...] })
        return response.json();
    };

    return { secureFetch };
}