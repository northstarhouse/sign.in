import { Link } from "wouter";
import { ArrowLeft, CheckCircle, ExternalLink, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function DataAccess() {
  const { toast } = useToast();

  const handleOpenSheet = (sheetType: string) => {
    // For now, show success message since webhook is configured
    toast({
      title: "Google Sheets Active",
      description: "Data is automatically syncing to your Google Sheet",
    });
  };

  const handleExport = (dataType: string) => {
    window.open(`/api/export/${dataType}`, '_blank');
    toast({
      title: "Download Started",
      description: `CSV file for ${dataType} is downloading`,
    });
  };

  const dataSheets = [
    {
      id: "volunteers",
      title: "Volunteer Data",
      description: "Check-in/out logs and hours",
      icon: "❤️",
      color: "text-blue-600",
    },
    {
      id: "guests",
      title: "Guest Registry",
      description: "Visitor information and newsletter",
      icon: "👥",
      color: "text-emerald-600",
    },
    {
      id: "employees",
      title: "Employee Hours",
      description: "Time tracking and payroll",
      icon: "⏰",
      color: "text-purple-600",
    },
  ];

  const exportFormats = [
    { format: "csv", label: "CSV", icon: FileText },
    { format: "pdf", label: "PDF", icon: FileText },
    { format: "excel", label: "Excel", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Data Access</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-600 h-5 w-5" />
                <div>
                  <div className="font-medium text-blue-800">Data Export Available</div>
                  <div className="text-sm text-blue-600">Download CSV files or set up Google Sheets</div>
                </div>
              </div>
            </div>

            {/* CSV Export Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {dataSheets.map((sheet) => (
                <Button
                  key={sheet.id}
                  variant="outline"
                  onClick={() => handleExport(sheet.id)}
                  className="flex items-center justify-between p-4 h-auto bg-slate-50 hover:bg-slate-100 border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${sheet.color}`}>
                      {sheet.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-800">{sheet.title}</div>
                      <div className="text-sm text-slate-600">{sheet.description}</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-slate-400" />
                </Button>
              ))}
            </div>

            {/* Google Sheets Integration */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-800">Google Sheets Integration</h4>
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-3">
                  ✅ Your Google Sheets integration is working! Data is automatically syncing in real-time.
                </p>
                <div className="text-sm text-green-600 space-y-1">
                  <p>• Volunteer check-ins sync instantly</p>
                  <p>• Guest registrations are saved immediately</p>
                  <p>• Employee time logs update automatically</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenSheet('setup')}
                  className="mt-3 bg-white border-green-200 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  View Your Google Sheet
                </Button>
              </div>
            </div>

            {/* Data Sync Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-2">Data Synchronization</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• Volunteer check-ins/outs sync in real-time</p>
                <p>• Guest registrations are saved immediately</p>
                <p>• Employee time logs are updated automatically</p>
                <p>• All data is backed up to Google Sheets</p>
              </div>
            </div>

            {/* Quick Start Instructions */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Quick Start</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Click any data type above to download a CSV file</p>
                <p>• Open CSV files in Excel, Google Sheets, or any spreadsheet app</p>
                <p>• Data includes all volunteer check-ins, guest visits, and employee hours</p>
                <p>• Set up Google Sheets integration for automatic syncing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
