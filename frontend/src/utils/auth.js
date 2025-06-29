// src/utils/auth.js

export const isAuthenticated = (expectedRole) => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded.role === expectedRole;
  } catch (error) {
    console.error('Token decoding failed', error);
    return false;
  }
};
