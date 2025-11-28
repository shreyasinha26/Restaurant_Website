// auth-utils.js - Utility functions for authenticated requests

// Get the stored token
function getAuthToken() {
    return localStorage.getItem('adminToken');
}

// Check if user is logged in
function isLoggedIn() {
    const token = getAuthToken();
    const admin = localStorage.getItem('admin');
    return !!(token && admin);
}

// Make authenticated API calls
async function authFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(url, mergedOptions);
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = 'login.html';
        return;
    }

    return response;
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = 'login.html';
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { getAuthToken, isLoggedIn, authFetch, logout };
} else {
    // Browser environment - attach to window object
    window.authUtils = { getAuthToken, isLoggedIn, authFetch, logout };
}