const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('Missing required environment variable: VITE_API_URL');
}

export const env = {
  apiUrl: apiUrl as string,
  appName: import.meta.env.VITE_APP_NAME as string,
  env: import.meta.env.VITE_ENV as string,
};
