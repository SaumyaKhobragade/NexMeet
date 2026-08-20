let IS_PROD = true;
const server = IS_PROD
    ? "https://nexmeet-api.saumyakhobragade.dev"
    : "http://localhost:3000";

export default server;
