import axios from "axios";

// Create a new axios instance
const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

// This is the magic! We're adding an "interceptor".
// This function will run before *every* request made with this 'api' instance.
api.interceptors.request.use(
  (config) => {
    // Get the user info from local storage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // If the user is logged in, add their token to the request headers
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
