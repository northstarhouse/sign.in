import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Guest } from "@shared/schema";

export default function GuestRegistration() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    purpose: "",
    wantsNewsletter: false,
  });
  const { toast } = useToast();

  const { data: todaysGuests = [], isLoading } = useQuery({
    queryKey: ["/api/guests/today"],
    queryFn: api.guests.getToday,
  });

  const registerMutation = useMutation({
    mutationFn: api.guests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        purpose: "",
        wantsNewsletter: false,
      });
      toast({
        title: "Success!",
        description: "Guest registered successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register guest",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <h1 className="text-xl font-semibold text-slate-800">Guest Registration</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Guest Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                />
              </div>

              {/* Purpose of Visit */}
              <div>
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                  <SelectTrigger className="bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="services">Accessing Services</SelectItem>
                    <SelectItem value="donation">Making a Donation</SelectItem>
                    <SelectItem value="volunteer">Volunteer Interest</SelectItem>
                    <SelectItem value="meeting">Meeting/Appointment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.wantsNewsletter}
                    onCheckedChange={(checked) => handleInputChange("wantsNewsletter", checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="newsletter" className="font-medium text-slate-800">
                      Join our newsletter
                    </Label>
                    <p className="text-sm text-slate-600">
                      Get updates about our programs and events
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register Guest"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Guests */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Guests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-slate-600 text-sm">Loading guests...</p>
              </div>
            ) : todaysGuests.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No guests registered today.</p>
            ) : (
              <div className="space-y-3">
                {todaysGuests.map((guest: Guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">
                        {guest.firstName} {guest.lastName}
                      </div>
                      <div className="text-sm text-slate-600">
                        {guest.purpose || "No purpose specified"}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(guest.visitedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
