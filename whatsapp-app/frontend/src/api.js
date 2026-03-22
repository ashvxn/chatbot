import axios from "axios";

// Automatically detect the correct URL based on how you are accessing the page
const isDev = window.location.port === "5173";
const baseURL = isDev ? "http://localhost:5000" : "https://jettie-indiscretionary-hilda.ngrok-free.dev";

export default axios.create({
  baseURL: `${baseURL}/api`
});

export { baseURL };