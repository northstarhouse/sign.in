import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, UserX, Trash2, Plus, UserPlus, ExternalLink, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { insertVolunteerSchema, insertEmployeeSchema } from "@shared/schema";
import type { Volunteer, Employee, InsertVolunteer, InsertEmployee } from "@shared/schema";
import PhotoUpload from "@/components/PhotoUpload";

export default function Manage() {
  const [showAddVolunteerDialog, setShowAddVolunteerDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const { toast } = useToast();

  const volunteerForm = useForm<InsertVolunteer>({
    resolver: zodResolver(insertVolunteerSchema),
    defaultValues: {
      name: "",
      role: "",
      photoUrl: null,
    },
  });

  const employeeForm = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      role: "",
      isActive: true,
    },
  });

  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery({
    queryKey: ["/api/volunteers"],
    queryFn: api.volunteers.getAll,
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: api.employees.getAll,
  });

  const deleteVolunteerMutation = useMutation({
    mutationFn: api.volunteers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success!",
        description: "Volunteer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete volunteer",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: api.employees.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success!",
        description: "Employee deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const addVolunteerMutation = useMutation({
    mutationFn: api.volunteers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAddVolunteerDialog(false);
      volunteerForm.reset();
      toast({
        title: "Success!",
        description: "New volunteer added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add volunteer",
        variant: "destructive",
      });
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: api.employees.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAddEmployeeDialog(false);
      employeeForm.reset();
      toast({
        title: "Success!",
        description: "New employee added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    },
  });

  const handleDeleteVolunteer = (id: number) => {
    deleteVolunteerMutation.mutate(id);
  };

  const handleDeleteEmployee = (id: number) => {
    deleteEmployeeMutation.mutate(id);
  };

  const onSubmitVolunteer = (data: InsertVolunteer) => {
    addVolunteerMutation.mutate(data);
  };

  const onSubmitEmployee = (data: InsertEmployee) => {
    addEmployeeMutation.mutate(data);
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
          <h1 className="text-xl font-semibold text-slate-800">Manage & Data</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Data Access Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Table className="h-5 w-5 mr-2" />
              Data Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <a 
                href="/api/export/volunteers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <div>
                  <h4 className="font-medium text-blue-800">Volunteer Data</h4>
                  <p className="text-sm text-blue-600">View volunteer records and activity logs</p>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-600" />
              </a>
              
              <a 
                href="/api/export/guests" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              >
                <div>
                  <h4 className="font-medium text-emerald-800">Guest Data</h4>
                  <p className="text-sm text-emerald-600">View guest registrations and contact info</p>
                </div>
                <ExternalLink className="h-4 w-4 text-emerald-600" />
              </a>
              
              <a 
                href="/api/export/employees" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
              >
                <div>
                  <h4 className="font-medium text-purple-800">Employee Data</h4>
                  <p className="text-sm text-purple-600">View employee time records and schedules</p>
                </div>
                <ExternalLink className="h-4 w-4 text-purple-600" />
              </a>
            </div>
          </CardContent>
        </Card>
        {/* Volunteers Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Volunteers</CardTitle>
            <Dialog open={showAddVolunteerDialog} onOpenChange={setShowAddVolunteerDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Volunteer</DialogTitle>
                </DialogHeader>
                <Form {...volunteerForm}>
                  <form onSubmit={volunteerForm.handleSubmit(onSubmitVolunteer)} className="space-y-4">
                    <FormField
                      control={volunteerForm.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <PhotoUpload
                            currentPhoto={field.value}
                            onPhotoChange={field.onChange}
                            disabled={addVolunteerMutation.isPending}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={volunteerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter volunteer's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={volunteerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. General Volunteer, Event Helper" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddVolunteerDialog(false)}
                        disabled={addVolunteerMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addVolunteerMutation.isPending}
                        className="bg-primary"
                      >
                        {addVolunteerMutation.isPending ? "Adding..." : "Add Volunteer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingVolunteers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No volunteers found. Add your first volunteer to get started.
              </div>
            ) : (
              volunteers.map((volunteer: Volunteer, index: number) => (
                <div key={volunteer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full avatar-gradient ${getAvatarColor(index)} overflow-hidden flex items-center justify-center`}>
                      {volunteer.photoUrl ? (
                        <img 
                          src={volunteer.photoUrl} 
                          alt={volunteer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {getInitials(volunteer.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{volunteer.name}</h4>
                      <p className="text-sm text-slate-600">{volunteer.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {volunteer.isCheckedIn && (
                      <Badge variant="outline" className="text-green-700 border-green-700 text-xs">
                        Checked In
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Volunteer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{volunteer.name}"? This action cannot be undone and will remove all their activity logs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVolunteer(volunteer.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Employees Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Employees</CardTitle>
            <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-secondary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <Form {...employeeForm}>
                  <form onSubmit={employeeForm.handleSubmit(onSubmitEmployee)} className="space-y-4">
                    <FormField
                      control={employeeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter employee's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Manager, Coordinator, Assistant" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddEmployeeDialog(false)}
                        disabled={addEmployeeMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addEmployeeMutation.isPending}
                        className="bg-secondary"
                      >
                        {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingEmployees ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary mx-auto"></div>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No employees found. Add your first employee to get started.
              </div>
            ) : (
              employees.map((employee: Employee, index: number) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full avatar-gradient ${getAvatarColor(index)} flex items-center justify-center`}>
                      <span className="text-white text-sm font-semibold">
                        {getInitials(employee.name)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{employee.name}</h4>
                      <p className="text-sm text-slate-600">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {employee.isActive && (
                      <Badge variant="outline" className="text-blue-700 border-blue-700 text-xs">
                        Active
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{employee.name}"? This action cannot be undone and will remove all their time clock records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}