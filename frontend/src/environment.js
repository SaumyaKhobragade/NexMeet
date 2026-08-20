let IS_PROD = true;
const server = IS_PROD
    ? import.meta.env.VITE_API_URL
    : "http://localhost:3000";

export default server;
