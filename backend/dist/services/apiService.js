"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// Create an axios instance with base URL
// Make sure this matches your actual backend URL
const api = axios_1.default.create({
    baseURL: '/api', // Change this if your API is hosted elsewhere
});
// Add request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    // If token exists, add to headers
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Add response interceptor for debugging
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    var _a, _b;
    // Log the error for debugging
    console.error('API Error:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status, ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
    return Promise.reject(error);
});
exports.default = api;
//# sourceMappingURL=apiService.js.map