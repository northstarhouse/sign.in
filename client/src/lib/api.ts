import { apiRequest } from "./queryClient";

export const api = {
  // Volunteers
  volunteers: {
    getAll: () => fetch("/api/volunteers").then(res => res.json()),
    checkIn: (id: number) => apiRequest("POST", `/api/volunteers/${id}/checkin`),
    checkOut: (id: number, activity: string) => 
      apiRequest("POST", `/api/volunteers/${id}/checkout`, { activity }),
    create: (data: any) => apiRequest("POST", "/api/volunteers", data),
    delete: (id: number) => apiRequest("DELETE", `/api/volunteers/${id}`),
  },

  // Guests
  guests: {
    getAll: () => fetch("/api/guests").then(res => res.json()),
    getToday: () => fetch("/api/guests/today").then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/guests", data),
  },

  // Employees
  employees: {
    getAll: () => fetch("/api/employees").then(res => res.json()),
    clockIn: (id: number) => apiRequest("POST", `/api/employees/${id}/clockin`),
    clockOut: (id: number) => apiRequest("POST", `/api/employees/${id}/clockout`),
    create: (data: any) => apiRequest("POST", "/api/employees", data),
    delete: (id: number) => apiRequest("DELETE", `/api/employees/${id}`),
  },

  // Stats
  stats: {
    getDashboard: () => fetch("/api/stats").then(res => res.json()),
  },

  // Employee logs
  employeeLogs: {
    getToday: () => fetch("/api/employee-logs/today").then(res => res.json()),
  },
};
