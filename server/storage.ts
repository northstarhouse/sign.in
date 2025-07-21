import {
  volunteers,
  volunteerLogs,
  guests,
  employees,
  employeeLogs,
  type Volunteer,
  type InsertVolunteer,
  type VolunteerLog,
  type InsertVolunteerLog,
  type Guest,
  type InsertGuest,
  type Employee,
  type InsertEmployee,
  type EmployeeLog,
  type InsertEmployeeLog,
} from "@shared/schema";

export interface IStorage {
  // Volunteers
  getAllVolunteers(): Promise<Volunteer[]>;
  getVolunteer(id: number): Promise<Volunteer | undefined>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  updateVolunteer(
    id: number,
    updates: Partial<Volunteer>,
  ): Promise<Volunteer | undefined>;
  deleteVolunteer(id: number): Promise<boolean>;

  // Volunteer Logs
  createVolunteerLog(log: InsertVolunteerLog): Promise<VolunteerLog>;
  getVolunteerLogs(volunteerId?: number): Promise<VolunteerLog[]>;

  // Guests
  getAllGuests(): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  getTodaysGuests(): Promise<Guest[]>;

  // Employees
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  deleteEmployee(id: number): Promise<boolean>;

  // Employee Logs
  createEmployeeLog(log: InsertEmployeeLog): Promise<EmployeeLog>;
  getEmployeeLogs(employeeId?: number): Promise<EmployeeLog[]>;
  getTodaysEmployeeLogs(): Promise<EmployeeLog[]>;
}

export class MemStorage implements IStorage {
  private volunteers: Map<number, Volunteer> = new Map();
  private volunteerLogs: Map<number, VolunteerLog> = new Map();
  private guests: Map<number, Guest> = new Map();
  private employees: Map<number, Employee> = new Map();
  private employeeLogs: Map<number, EmployeeLog> = new Map();

  private currentVolunteerId = 1;
  private currentVolunteerLogId = 1;
  private currentGuestId = 1;
  private currentEmployeeId = 1;
  private currentEmployeeLogId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample volunteers
    const sampleVolunteers = [
      {
        name: "Sarah Johnson",
        role: "Regular Volunteer",
        isCheckedIn: false,
        photoUrl: null,
      },
      {
        name: "Mike Chen",
        role: "Team Leader",
        isCheckedIn: false,
        photoUrl: null,
      },
      {
        name: "Anna Lopez",
        role: "New Volunteer",
        isCheckedIn: false,
        photoUrl: null,
      },
      {
        name: "David Kim",
        role: "Regular Volunteer",
        isCheckedIn: false,
        photoUrl: null,
      },
      {
        name: "Lisa Wong",
        role: "Coordinator",
        isCheckedIn: false,
        photoUrl: null,
      },
    ];

    sampleVolunteers.forEach((volunteer) => {
      const id = this.currentVolunteerId++;
      this.volunteers.set(id, {
        id,
        name: volunteer.name,
        role: volunteer.role,
        photoUrl: volunteer.photoUrl,
        isCheckedIn: volunteer.isCheckedIn,
        lastCheckIn: null,
        lastCheckOut: null,
        createdAt: new Date(),
      });
    });

    // Sample employees
    const sampleEmployees = [
      { name: "John Doe", role: "Manager", isActive: true },
      { name: "Jane Smith", role: "Coordinator", isActive: true },
      { name: "David Brown", role: "Assistant", isActive: true },
    ];

    sampleEmployees.forEach((employee) => {
      const id = this.currentEmployeeId++;
      this.employees.set(id, {
        id,
        name: employee.name,
        role: employee.role,
        isActive: employee.isActive,
        createdAt: new Date(),
      });
    });
  }

  // Volunteers
  async getAllVolunteers(): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values());
  }

  async getVolunteer(id: number): Promise<Volunteer | undefined> {
    return this.volunteers.get(id);
  }

  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const id = this.currentVolunteerId++;
    const newVolunteer: Volunteer = {
      id,
      name: volunteer.name,
      role: volunteer.role,
      photoUrl: volunteer.photoUrl || null,
      isCheckedIn: false,
      lastCheckIn: null,
      lastCheckOut: null,
      createdAt: new Date(),
    };
    this.volunteers.set(id, newVolunteer);
    return newVolunteer;
  }

  async updateVolunteer(
    id: number,
    updates: Partial<Volunteer>,
  ): Promise<Volunteer | undefined> {
    const volunteer = this.volunteers.get(id);
    if (!volunteer) return undefined;

    const updatedVolunteer = { ...volunteer, ...updates };
    this.volunteers.set(id, updatedVolunteer);
    return updatedVolunteer;
  }

  async deleteVolunteer(id: number): Promise<boolean> {
    const exists = this.volunteers.has(id);
    if (exists) {
      this.volunteers.delete(id);
      // Also delete associated logs
      const logsToDelete = Array.from(this.volunteerLogs.entries())
        .filter(([, log]) => log.volunteerId === id)
        .map(([logId]) => logId);

      logsToDelete.forEach((logId) => this.volunteerLogs.delete(logId));
    }
    return exists;
  }

  // Volunteer Logs
  async createVolunteerLog(log: InsertVolunteerLog): Promise<VolunteerLog> {
    const id = this.currentVolunteerLogId++;
    const newLog: VolunteerLog = {
      id,
      action: log.action,
      volunteerId: log.volunteerId || null,
      timestamp: new Date(),
      activity: log.activity || null,
      hoursWorked: log.hoursWorked || null,
    };
    this.volunteerLogs.set(id, newLog);
    return newLog;
  }

  async getVolunteerLogs(volunteerId?: number): Promise<VolunteerLog[]> {
    const logs = Array.from(this.volunteerLogs.values());
    if (volunteerId) {
      return logs.filter((log) => log.volunteerId === volunteerId);
    }
    return logs;
  }

  // Guests
  async getAllGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const newGuest: Guest = {
      id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || null,
      phone: guest.phone || null,
      purpose: guest.purpose || null,
      wantsNewsletter: guest.wantsNewsletter || null,
      visitedAt: new Date(),
    };
    this.guests.set(id, newGuest);
    return newGuest;
  }

  async getTodaysGuests(): Promise<Guest[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.guests.values()).filter((guest) => {
      const visitDate = new Date(guest.visitedAt);
      return visitDate >= today && visitDate < tomorrow;
    });
  }

  // Employees
  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      id,
      name: employee.name,
      role: employee.role,
      isActive: employee.isActive || null,
      createdAt: new Date(),
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const exists = this.employees.has(id);
    if (exists) {
      this.employees.delete(id);
      // Also delete associated logs
      const logsToDelete = Array.from(this.employeeLogs.entries())
        .filter(([, log]) => log.employeeId === id)
        .map(([logId]) => logId);

      logsToDelete.forEach((logId) => this.employeeLogs.delete(logId));
    }
    return exists;
  }

  // Employee Logs
  async createEmployeeLog(log: InsertEmployeeLog): Promise<EmployeeLog> {
    const id = this.currentEmployeeLogId++;
    const newLog: EmployeeLog = {
      id,
      action: log.action,
      employeeId: log.employeeId || null,
      timestamp: new Date(),
    };
    this.employeeLogs.set(id, newLog);
    return newLog;
  }

  async getEmployeeLogs(employeeId?: number): Promise<EmployeeLog[]> {
    const logs = Array.from(this.employeeLogs.values());
    if (employeeId) {
      return logs.filter((log) => log.employeeId === employeeId);
    }
    return logs;
  }

  async getTodaysEmployeeLogs(): Promise<EmployeeLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.employeeLogs.values()).filter((log) => {
      if (!log.timestamp) return false;
      const logDate = new Date(log.timestamp);
      return logDate >= today && logDate < tomorrow;
    });
  }
}

export const storage = new MemStorage();
