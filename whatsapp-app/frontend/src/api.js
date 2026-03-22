import axios from "axios";

// Use localhost only when actually running locally, otherwise point to the EC2 backend
const isDev = window.location.hostname === "localhost";
const baseURL = isDev ? "http://localhost:5000" : "https://jettie-indiscretionary-hilda.ngrok-free.dev";

export default axios.create({
  baseURL: `${baseURL}/api`
});

export { baseURL };