import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSheetsService } from "./services/googleSheets";
import { 
  insertVolunteerSchema, 
  insertVolunteerLogSchema,
  insertGuestSchema,
  insertEmployeeSchema,
  insertEmployeeLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Google Sheets on startup (if configured)
  try {
    await googleSheetsService.createSheetsIfNotExists();
  } catch (error) {
    console.log('Google Sheets not configured, skipping sync');
  }

  // Volunteer routes
  app.get("/api/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      res.json(volunteers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.post("/api/volunteers", async (req, res) => {
    try {
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      res.status(400).json({ message: "Invalid volunteer data" });
    }
  });

  app.patch("/api/volunteers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const volunteer = await storage.updateVolunteer(id, updates);
      
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      
      res.json(volunteer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update volunteer" });
    }
  });

  app.delete("/api/volunteers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVolunteer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Volunteer not found" });
      }

      // Sync to Google Sheets after deletion
      try {
        const volunteers = await storage.getAllVolunteers();
        const logs = await storage.getVolunteerLogs();
        await googleSheetsService.syncVolunteerData(volunteers, logs);
      } catch (error) {
        console.log('Google Sheets sync failed:', error);
      }
      
      res.json({ message: "Volunteer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete volunteer" });
    }
  });

  // Volunteer check-in/out
  app.post("/api/volunteers/:id/checkin", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const volunteer = await storage.getVolunteer(id);
      
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }

      const now = new Date();
      const updatedVolunteer = await storage.updateVolunteer(id, {
        isCheckedIn: true,
        lastCheckIn: now,
      });

      // Log the check-in
      await storage.createVolunteerLog({
        volunteerId: id,
        action: "check_in",
      });

      // Sync to Google Sheets
      const volunteers = await storage.getAllVolunteers();
      const logs = await storage.getVolunteerLogs();
      await googleSheetsService.syncVolunteerData(volunteers, logs);

      res.json(updatedVolunteer);
    } catch (error) {
      res.status(500).json({ message: "Failed to check in volunteer" });
    }
  });

  app.post("/api/volunteers/:id/checkout", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { activity } = req.body;
      const volunteer = await storage.getVolunteer(id);
      
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }

      const now = new Date();
      const hoursWorked = volunteer.lastCheckIn 
        ? Math.floor((now.getTime() - volunteer.lastCheckIn.getTime()) / (1000 * 60))
        : 0;

      const updatedVolunteer = await storage.updateVolunteer(id, {
        isCheckedIn: false,
        lastCheckOut: now,
      });

      // Log the check-out
      await storage.createVolunteerLog({
        volunteerId: id,
        action: "check_out",
        activity,
        hoursWorked,
      });

      // Sync to Google Sheets
      const volunteers = await storage.getAllVolunteers();
      const logs = await storage.getVolunteerLogs();
      await googleSheetsService.syncVolunteerData(volunteers, logs);

      res.json(updatedVolunteer);
    } catch (error) {
      res.status(500).json({ message: "Failed to check out volunteer" });
    }
  });

  // Guest routes
  app.get("/api/guests", async (req, res) => {
    try {
      const guests = await storage.getAllGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.get("/api/guests/today", async (req, res) => {
    try {
      const guests = await storage.getTodaysGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's guests" });
    }
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      
      // Sync to Google Sheets
      const guests = await storage.getAllGuests();
      await googleSheetsService.syncGuestData(guests);
      
      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data" });
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmployee(id);
      
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Sync to Google Sheets after deletion
      try {
        const employees = await storage.getAllEmployees();
        const logs = await storage.getTodaysEmployeeLogs();
        await googleSheetsService.syncEmployeeData(employees, logs);
      } catch (error) {
        console.log('Google Sheets sync failed:', error);
      }
      
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Employee clock in/out
  app.post("/api/employees/:id/clockin", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const log = await storage.createEmployeeLog({
        employeeId: id,
        action: "clock_in",
      });

      // Sync to Google Sheets
      const employees = await storage.getAllEmployees();
      const logs = await storage.getEmployeeLogs();
      await googleSheetsService.syncEmployeeData(employees, logs);

      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to clock in employee" });
    }
  });

  app.post("/api/employees/:id/clockout", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const log = await storage.createEmployeeLog({
        employeeId: id,
        action: "clock_out",
      });

      // Sync to Google Sheets
      const employees = await storage.getAllEmployees();
      const logs = await storage.getEmployeeLogs();
      await googleSheetsService.syncEmployeeData(employees, logs);

      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to clock out employee" });
    }
  });

  // Stats route for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      const todaysGuests = await storage.getTodaysGuests();
      const employees = await storage.getAllEmployees();
      
      const stats = {
        volunteers: volunteers.filter(v => v.isCheckedIn).length,
        guests: todaysGuests.length,
        employees: employees.filter(e => e.isActive).length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Employee logs for today
  app.get("/api/employee-logs/today", async (req, res) => {
    try {
      const logs = await storage.getTodaysEmployeeLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's employee logs" });
    }
  });

  // CSV Export routes
  app.get("/api/export/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      const logs = await storage.getVolunteerLogs();
      
      let csv = "ID,Name,Role,Status,Last Check In,Last Check Out,Created At\n";
      volunteers.forEach(volunteer => {
        csv += `${volunteer.id},"${volunteer.name}","${volunteer.role}",${volunteer.isCheckedIn ? 'Checked In' : 'Available'},${volunteer.lastCheckIn || ''},${volunteer.lastCheckOut || ''},${volunteer.createdAt}\n`;
      });
      
      csv += "\n\nVolunteer Logs\n";
      csv += "ID,Volunteer ID,Action,Timestamp,Activity,Hours Worked\n";
      logs.forEach(log => {
        csv += `${log.id},${log.volunteerId},"${log.action}",${log.timestamp},"${log.activity || ''}",${log.hoursWorked || 0}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=volunteers.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export volunteers" });
    }
  });

  app.get("/api/export/guests", async (req, res) => {
    try {
      const guests = await storage.getAllGuests();
      
      let csv = "ID,First Name,Last Name,Email,Phone,Purpose,Newsletter,Visited At\n";
      guests.forEach(guest => {
        csv += `${guest.id},"${guest.firstName}","${guest.lastName}","${guest.email || ''}","${guest.phone || ''}","${guest.purpose || ''}",${guest.wantsNewsletter ? 'Yes' : 'No'},${guest.visitedAt}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=guests.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export guests" });
    }
  });

  app.get("/api/export/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const logs = await storage.getEmployeeLogs();
      
      let csv = "ID,Name,Role,Status,Created At\n";
      employees.forEach(employee => {
        csv += `${employee.id},"${employee.name}","${employee.role}",${employee.isActive ? 'Active' : 'Inactive'},${employee.createdAt}\n`;
      });
      
      csv += "\n\nEmployee Logs\n";
      csv += "ID,Employee ID,Action,Timestamp\n";
      logs.forEach(log => {
        csv += `${log.id},${log.employeeId},"${log.action}",${log.timestamp}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export employees" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
