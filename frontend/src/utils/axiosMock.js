import axios from 'axios';
import { mockExams, mockQuestions, mockLeaderboard, mockMetrics } from '../data/mockExams';
import { mockResults } from '../data/mockResults';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

/* ---------- Request interceptor: attach token ---------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arithexam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- Response interceptor: mock all API calls ---------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config } = error;
    if (!config) return Promise.reject(error);

    const { url, method, data } = config;
    const body = data ? JSON.parse(data) : {};

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // AUTH
        if (url === '/auth/login' && method === 'post') {
          if (body.email && body.password) {
            resolve({
              data: {
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                  id: 'USR001',
                  name: 'Demo User',
                  email: body.email,
                  role: body.isAdmin ? 'admin' : 'candidate',
                },
              },
              status: 200,
            });
          }
        }

        if (url === '/auth/register' && method === 'post') {
          resolve({
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                id: 'USR' + Date.now(),
                name: body.name || 'New User',
                email: body.email,
                role: 'candidate',
              },
              message: 'Registration successful'
            },
            status: 201,
          });
        }

        // EXAMS
        if (url === '/exams' && method === 'get') {
          resolve({ data: { exams: mockExams }, status: 200 });
        }

        if (url?.startsWith('/exams/join/') && method === 'post') {
          const code = url.split('/exams/join/')[1];
          const exam = mockExams.find((e) => e.testCode === code);
          if (exam) {
            resolve({ data: { exam, valid: true }, status: 200 });
          } else {
            resolve({ data: { valid: false, message: 'Invalid test code' }, status: 404 });
          }
        }

        if (url === '/exams/questions' && method === 'get') {
          resolve({ data: { questions: mockQuestions }, status: 200 });
        }

        if (url === '/exams/submit' && method === 'post') {
          resolve({ data: { message: 'Exam submitted successfully', resultId: 'RES001' }, status: 200 });
        }

        if (url === '/exams/autosave' && method === 'post') {
          resolve({ data: { message: 'Answers auto-saved' }, status: 200 });
        }

        // RESULTS
        if (url?.startsWith('/results') && method === 'get') {
          resolve({ data: { results: mockResults }, status: 200 });
        }

        // DASHBOARD
        if (url === '/dashboard/metrics' && method === 'get') {
          resolve({ data: { metrics: mockMetrics }, status: 200 });
        }

        if (url === '/dashboard/leaderboard' && method === 'get') {
          resolve({ data: { leaderboard: mockLeaderboard }, status: 200 });
        }

        // Default fallback
        resolve({ data: { message: 'OK' }, status: 200 });
      }, 300 + Math.random() * 400);
    });
  }
);

export default api;
