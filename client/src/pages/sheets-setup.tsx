import { Link } from "wouter";
import { ArrowLeft, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SheetsSetup() {
  const { toast } = useToast();

  const appsScript = `function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // Replace with your actual spreadsheet ID
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    if (data.type === 'volunteers') {
      // Update Volunteers sheet
      let sheet = spreadsheet.getSheetByName('Volunteers');
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Volunteers');
        sheet.getRange('A1:G1').setValues([['ID', 'Name', 'Role', 'Status', 'Last Check In', 'Last Check Out', 'Created At']]);
      }
      
      // Clear existing data (keep headers)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).clearContent();
      }
      
      // Add volunteer data
      if (data.volunteers.length > 0) {
        const volunteerRows = data.volunteers.map(v => [
          v.id, v.name, v.role, v.status, v.lastCheckIn, v.lastCheckOut, v.createdAt
        ]);
        sheet.getRange(2, 1, volunteerRows.length, 7).setValues(volunteerRows);
      }
      
      // Update Volunteer Logs sheet
      let logSheet = spreadsheet.getSheetByName('Volunteer_Logs');
      if (!logSheet) {
        logSheet = spreadsheet.insertSheet('Volunteer_Logs');
        logSheet.getRange('A1:F1').setValues([['ID', 'Volunteer ID', 'Action', 'Timestamp', 'Activity', 'Hours Worked']]);
      }
      
      // Clear existing log data
      if (logSheet.getLastRow() > 1) {
        logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 6).clearContent();
      }
      
      // Add log data
      if (data.logs.length > 0) {
        const logRows = data.logs.map(l => [
          l.id, l.volunteerId, l.action, l.timestamp, l.activity, l.hoursWorked
        ]);
        logSheet.getRange(2, 1, logRows.length, 6).setValues(logRows);
      }
    }
    
    if (data.type === 'guests') {
      let sheet = spreadsheet.getSheetByName('Guests');
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Guests');
        sheet.getRange('A1:H1').setValues([['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Purpose', 'Newsletter', 'Visited At']]);
      }
      
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).clearContent();
      }
      
      if (data.guests.length > 0) {
        const guestRows = data.guests.map(g => [
          g.id, g.firstName, g.lastName, g.email, g.phone, g.purpose, g.wantsNewsletter, g.visitedAt
        ]);
        sheet.getRange(2, 1, guestRows.length, 8).setValues(guestRows);
      }
    }
    
    if (data.type === 'employees') {
      let sheet = spreadsheet.getSheetByName('Employees');
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Employees');
        sheet.getRange('A1:E1').setValues([['ID', 'Name', 'Role', 'Status', 'Created At']]);
      }
      
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
      }
      
      if (data.employees.length > 0) {
        const employeeRows = data.employees.map(e => [
          e.id, e.name, e.role, e.status, e.createdAt
        ]);
        sheet.getRange(2, 1, employeeRows.length, 5).setValues(employeeRows);
      }
      
      let logSheet = spreadsheet.getSheetByName('Employee_Logs');
      if (!logSheet) {
        logSheet = spreadsheet.insertSheet('Employee_Logs');
        logSheet.getRange('A1:D1').setValues([['ID', 'Employee ID', 'Action', 'Timestamp']]);
      }
      
      if (logSheet.getLastRow() > 1) {
        logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 4).clearContent();
      }
      
      if (data.logs.length > 0) {
        const logRows = data.logs.map(l => [
          l.id, l.employeeId, l.action, l.timestamp
        ]);
        logSheet.getRange(2, 1, logRows.length, 4).setValues(logRows);
      }
    }
    
    return ContentService.createTextOutput('Success');
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/data-access">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Google Sheets Setup</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Easy Google Sheets Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold text-slate-800">Create a Google Sheet</h3>
              </div>
              <div className="ml-11 text-sm text-slate-600">
                <p>• Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sheets.google.com</a></p>
                <p>• Click "Blank" to create a new spreadsheet</p>
                <p>• Name it something like "Volunteer Check-in Data"</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold text-slate-800">Open Apps Script</h3>
              </div>
              <div className="ml-11 text-sm text-slate-600">
                <p>• In your Google Sheet, go to Extensions → Apps Script</p>
                <p>• Delete any existing code in the editor</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold text-slate-800">Copy and Paste This Code</h3>
              </div>
              <div className="ml-11">
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono relative max-h-96 overflow-y-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(appsScript)}
                    className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="whitespace-pre-wrap pr-16">{appsScript}</pre>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <h3 className="font-semibold text-slate-800">Update the Spreadsheet ID</h3>
              </div>
              <div className="ml-11 text-sm text-slate-600">
                <p>• In the code, find the line: <code className="bg-slate-200 px-1 rounded">const spreadsheetId = 'YOUR_SPREADSHEET_ID';</code></p>
                <p>• Replace 'YOUR_SPREADSHEET_ID' with your actual spreadsheet ID</p>
                <p>• You can find this in your Google Sheet URL: <code className="bg-slate-200 px-1 rounded">sheets.google.com/spreadsheets/d/<strong>YOUR_ID_HERE</strong>/edit</code></p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                <h3 className="font-semibold text-slate-800">Deploy as Web App</h3>
              </div>
              <div className="ml-11 text-sm text-slate-600">
                <p>• Click "Deploy" → "New deployment"</p>
                <p>• Choose "Web app" as the type</p>
                <p>• Set "Execute as" to "Me"</p>
                <p>• Set "Who has access" to "Anyone"</p>
                <p>• Click "Deploy"</p>
                <p>• Copy the web app URL that appears</p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">6</div>
                <h3 className="font-semibold text-slate-800">Add the URL to Your App</h3>
              </div>
              <div className="ml-11 text-sm text-slate-600">
                <p>• Contact your app administrator</p>
                <p>• Ask them to add the web app URL as the GOOGLE_SHEETS_WEBHOOK_URL environment variable</p>
                <p>• Once added, your data will automatically sync to Google Sheets!</p>
              </div>
            </div>

            {/* Success Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-600 h-5 w-5" />
                <div>
                  <div className="font-medium text-green-800">That's it!</div>
                  <div className="text-sm text-green-600">Once set up, volunteer check-ins, guest registrations, and employee time logs will automatically appear in your Google Sheet in real-time.</div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Make sure you're signed into the Google account that owns the spreadsheet</p>
                <p>• The spreadsheet ID is the long string in your Google Sheets URL</p>
                <p>• You can test by manually triggering a data sync from your app</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}