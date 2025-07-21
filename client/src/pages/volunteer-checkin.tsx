import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Search, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckoutModal } from "@/components/checkout-modal";
import PhotoUpload from "@/components/PhotoUpload";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { insertVolunteerSchema } from "@shared/schema";
import type { Volunteer, InsertVolunteer } from "@shared/schema";

export default function VolunteerCheckin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked-in" | "checked-out">("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertVolunteer>({
    resolver: zodResolver(insertVolunteerSchema),
    defaultValues: {
      name: "",
      role: "",
      photoUrl: null,
    },
  });

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["/api/volunteers"],
    queryFn: api.volunteers.getAll,
  });

  const checkInMutation = useMutation({
    mutationFn: api.volunteers.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success!",
        description: "Volunteer checked in successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in volunteer",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ id, activity }: { id: number; activity: string }) =>
      api.volunteers.checkOut(id, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowCheckoutModal(false);
      setSelectedVolunteer(null);
      toast({
        title: "Success!",
        description: "Volunteer checked out successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check out volunteer",
        variant: "destructive",
      });
    },
  });

  const addVolunteerMutation = useMutation({
    mutationFn: api.volunteers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAddDialog(false);
      form.reset();
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



  const filteredVolunteers = volunteers.filter((volunteer: Volunteer) => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "checked-in" && volunteer.isCheckedIn) ||
                         (statusFilter === "checked-out" && !volunteer.isCheckedIn);
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (volunteer: Volunteer) => {
    checkInMutation.mutate(volunteer.id);
  };

  const handleCheckOut = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = (activity: string) => {
    if (selectedVolunteer) {
      checkOutMutation.mutate({ id: selectedVolunteer.id, activity });
    }
  };

  const onSubmitVolunteer = (data: InsertVolunteer) => {
    addVolunteerMutation.mutate(data);
  };



  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["avatar-blue", "avatar-purple", "avatar-emerald", "avatar-pink", "avatar-indigo"];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold text-slate-800">Volunteer Check-In</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary">
                <UserPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Volunteer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitVolunteer)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                      onClick={() => setShowAddDialog(false)}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            type="text"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2">
          <Button
            variant={statusFilter === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "checked-in" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter("checked-in")}
          >
            Checked In
          </Button>
          <Button
            variant={statusFilter === "checked-out" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter("checked-out")}
          >
            Available
          </Button>
        </div>

        {/* Volunteer List */}
        <div className="space-y-3">
          {filteredVolunteers.map((volunteer: Volunteer, index: number) => (
            <Card key={volunteer.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full avatar-gradient ${getAvatarColor(index)} overflow-hidden flex items-center justify-center ${
                      volunteer.isCheckedIn ? "ring-2 ring-emerald-400" : ""
                    }`}>
                      {volunteer.photoUrl ? (
                        <img 
                          src={volunteer.photoUrl} 
                          alt={volunteer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {getInitials(volunteer.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{volunteer.name}</h3>
                      <p className="text-sm text-slate-600">{volunteer.role}</p>
                      {volunteer.isCheckedIn && volunteer.lastCheckIn && (
                        <p className="text-xs text-green-700">
                          Checked in at {new Date(volunteer.lastCheckIn).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {volunteer.isCheckedIn && (
                      <Badge variant="outline" className="text-green-700 border-green-700">
                        Checked In
                      </Badge>
                    )}
                    {volunteer.isCheckedIn ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCheckOut(volunteer)}
                        disabled={checkOutMutation.isPending}
                      >
                        Check Out
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCheckIn(volunteer)}
                        disabled={checkInMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">No volunteers found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false);
          setSelectedVolunteer(null);
        }}
        volunteer={selectedVolunteer}
        onSubmit={handleCheckoutSubmit}
        isLoading={checkOutMutation.isPending}
      />
    </div>
  );
}
