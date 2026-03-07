// Simple client-side auth using localStorage
// Change this password to your own
export const ADMIN_PASSWORD = 'kitchen2024';
export const AUTH_KEY = 'kds_admin_auth';

export function isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(password) {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
}
