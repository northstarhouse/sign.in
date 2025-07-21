import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photoUrl: text("photo_url"), // URL or base64 data for volunteer photo
  isCheckedIn: boolean("is_checked_in").default(false),
  lastCheckIn: timestamp("last_check_in"),
  lastCheckOut: timestamp("last_check_out"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const volunteerLogs = pgTable("volunteer_logs", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").references(() => volunteers.id),
  action: text("action").notNull(), // 'check_in' or 'check_out'
  timestamp: timestamp("timestamp").defaultNow(),
  activity: text("activity"), // Activity description for check-out
  hoursWorked: integer("hours_worked"), // In minutes
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  purpose: text("purpose"),
  wantsNewsletter: boolean("wants_newsletter").default(false),
  visitedAt: timestamp("visited_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeeLogs = pgTable("employee_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  action: text("action").notNull(), // 'clock_in' or 'clock_out'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
  lastCheckIn: true,
  lastCheckOut: true,
});

export const insertVolunteerLogSchema = createInsertSchema(volunteerLogs).omit({
  id: true,
  timestamp: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  visitedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeLogSchema = createInsertSchema(employeeLogs).omit({
  id: true,
  timestamp: true,
});

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type VolunteerLog = typeof volunteerLogs.$inferSelect;
export type InsertVolunteerLog = z.infer<typeof insertVolunteerLogSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type EmployeeLog = typeof employeeLogs.$inferSelect;
export type InsertEmployeeLog = z.infer<typeof insertEmployeeLogSchema>;
