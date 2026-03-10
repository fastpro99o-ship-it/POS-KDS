// Use environment variable for security, fallback to a default if not set
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Admin@2024!POS';
export const AUTH_KEY = 'kds_admin_auth_v2';

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
