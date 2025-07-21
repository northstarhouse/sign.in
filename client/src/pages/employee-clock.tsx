import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Employee, EmployeeLog } from "@shared/schema";

export default function EmployeeClock() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: api.employees.getAll,
  });

  const { data: todaysLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/employee-logs/today"],
    queryFn: api.employeeLogs.getToday,
  });

  const clockInMutation = useMutation({
    mutationFn: api.employees.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedEmployeeId("");
      toast({
        title: "Success!",
        description: "Employee clocked in successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock in employee",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: api.employees.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedEmployeeId("");
      toast({
        title: "Success!",
        description: "Employee clocked out successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock out employee",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }
    clockInMutation.mutate(parseInt(selectedEmployeeId));
  };

  const handleClockOut = () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }
    clockOutMutation.mutate(parseInt(selectedEmployeeId));
  };

  const getEmployeeHours = (employeeId: number) => {
    const employeeLogs = todaysLogs.filter((log: EmployeeLog) => log.employeeId === employeeId);
    const clockInLogs = employeeLogs.filter((log: EmployeeLog) => log.action === "clock_in");
    const clockOutLogs = employeeLogs.filter((log: EmployeeLog) => log.action === "clock_out");
    
    let totalHours = 0;
    for (let i = 0; i < Math.min(clockInLogs.length, clockOutLogs.length); i++) {
      const clockIn = new Date(clockInLogs[i].timestamp);
      const clockOut = new Date(clockOutLogs[i].timestamp);
      totalHours += (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    }
    
    return totalHours.toFixed(1);
  };

  const isEmployeeClockedIn = (employeeId: number) => {
    const employeeLogs = todaysLogs.filter((log: EmployeeLog) => log.employeeId === employeeId);
    const lastLog = employeeLogs[employeeLogs.length - 1];
    return lastLog && lastLog.action === "clock_in";
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["avatar-blue", "avatar-purple", "avatar-emerald", "avatar-pink", "avatar-indigo"];
    return colors[index % colors.length];
  };

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
          <h1 className="text-xl font-semibold text-slate-800">Employee Clock</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Clock In/Out Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="text-slate-600">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-4">
              {/* Employee Selection */}
              <div>
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: Employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clock Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleClockIn}
                  disabled={clockInMutation.isPending || employeesLoading}
                  className="bg-green-600 hover:bg-green-700 py-4"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Clock In
                </Button>
                <Button
                  onClick={handleClockOut}
                  disabled={clockOutMutation.isPending || employeesLoading}
                  variant="destructive"
                  className="py-4"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Today's Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-slate-600 text-sm">Loading hours...</p>
              </div>
            ) : employees.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No employees found.</p>
            ) : (
              <div className="space-y-3">
                {employees.map((employee: Employee, index: number) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full avatar-gradient ${getAvatarColor(index)}`}>
                        <span className="text-white font-medium text-sm">
                          {getInitials(employee.name)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{employee.name}</div>
                        <div className="text-sm text-slate-600">{employee.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">
                        {getEmployeeHours(employee.id)} hrs
                      </div>
                      <div className={`text-sm ${isEmployeeClockedIn(employee.id) ? 'text-green-700' : 'text-slate-600'}`}>
                        {isEmployeeClockedIn(employee.id) ? 'Clocked in' : 'Clocked out'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
