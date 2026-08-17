let IS_PROD = false;
const server = IS_PROD
    ? "https://nexmeet-backend.saumyakhobragade.dev"
    : "http://localhost:3000";

export default server;
