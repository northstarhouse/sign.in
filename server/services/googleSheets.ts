import type { Volunteer, Guest, Employee, VolunteerLog, EmployeeLog } from '@shared/schema';

class GoogleSheetsService {
  private webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  }

  async syncVolunteerData(volunteers: Volunteer[], logs: VolunteerLog[]) {
    if (!this.webhookUrl) return;

    try {
      const data = {
        type: 'volunteers',
        volunteers: volunteers.map(volunteer => ({
          id: volunteer.id,
          name: volunteer.name,
          role: volunteer.role,
          status: volunteer.isCheckedIn ? 'Checked In' : 'Available',
          lastCheckIn: volunteer.lastCheckIn?.toISOString() || '',
          lastCheckOut: volunteer.lastCheckOut?.toISOString() || '',
          createdAt: volunteer.createdAt?.toISOString() || '',
        })),
        logs: logs.map(log => ({
          id: log.id,
          volunteerId: log.volunteerId,
          action: log.action,
          timestamp: log.timestamp?.toISOString() || '',
          activity: log.activity || '',
          hoursWorked: log.hoursWorked || 0,
        }))
      };

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Volunteer data synced to Google Sheets');
    } catch (error) {
      console.error('Error syncing volunteer data:', error);
    }
  }

  async syncGuestData(guests: Guest[]) {
    if (!this.webhookUrl) return;

    try {
      const data = {
        type: 'guests',
        guests: guests.map(guest => ({
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email || '',
          phone: guest.phone || '',
          purpose: guest.purpose || '',
          wantsNewsletter: guest.wantsNewsletter ? 'Yes' : 'No',
          visitedAt: guest.visitedAt?.toISOString() || '',
        }))
      };

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Guest data synced to Google Sheets');
    } catch (error) {
      console.error('Error syncing guest data:', error);
    }
  }

  async syncEmployeeData(employees: Employee[], logs: EmployeeLog[]) {
    if (!this.webhookUrl) return;

    try {
      const data = {
        type: 'employees',
        employees: employees.map(employee => ({
          id: employee.id,
          name: employee.name,
          role: employee.role,
          status: employee.isActive ? 'Active' : 'Inactive',
          createdAt: employee.createdAt?.toISOString() || '',
        })),
        logs: logs.map(log => ({
          id: log.id,
          employeeId: log.employeeId,
          action: log.action,
          timestamp: log.timestamp?.toISOString() || '',
        }))
      };

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Employee data synced to Google Sheets');
    } catch (error) {
      console.error('Error syncing employee data:', error);
    }
  }

  async createSheetsIfNotExists() {
    // For webhook approach, no need to create sheets programmatically
    // The Google Apps Script will handle sheet creation
    console.log('Using webhook approach - sheets will be created automatically');
  }
}

export const googleSheetsService = new GoogleSheetsService();
