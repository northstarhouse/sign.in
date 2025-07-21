import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Utensils, Fan, Phone, HandHeart, Edit } from "lucide-react";
import type { Volunteer } from "@shared/schema";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
  onSubmit: (activity: string) => void;
  isLoading: boolean;
}

export function CheckoutModal({ isOpen, onClose, volunteer, onSubmit, isLoading }: CheckoutModalProps) {
  const [selectedActivity, setSelectedActivity] = useState("");
  const [customActivity, setCustomActivity] = useState("");

  const activityOptions = [
    { id: "meals", label: "Helped serve meals", icon: Utensils },
    { id: "cleaning", label: "Cleaned and organized", icon: Fan },
    { id: "phones", label: "Answered phones", icon: Phone },
    { id: "clients", label: "Assisted clients", icon: HandHeart },
  ];

  const handleSubmit = () => {
    const activity = customActivity || selectedActivity;
    if (activity) {
      onSubmit(activity);
    }
  };

  const handleClose = () => {
    setSelectedActivity("");
    setCustomActivity("");
    onClose();
  };

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
    setCustomActivity("");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getHoursWorked = () => {
    if (!volunteer?.lastCheckIn) return "0.0";
    const now = new Date();
    const checkIn = new Date(volunteer.lastCheckIn);
    const hours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Activity Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {volunteer && (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-semibold text-lg">
                  {getInitials(volunteer.name)}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800">{volunteer.name}</h4>
              <p className="text-sm text-slate-600">{getHoursWorked()} hours volunteered</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              What did you work on today?
            </Label>
            
            {/* Activity Blurbs */}
            <div className="space-y-2 mb-4">
              {activityOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedActivity === option.label ? "default" : "outline"}
                  onClick={() => handleActivitySelect(option.label)}
                  className="w-full justify-start p-3 h-auto"
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom Activity Input */}
            <div className="relative">
              <Edit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Or describe your own activity..."
                value={customActivity}
                onChange={(e) => {
                  setCustomActivity(e.target.value);
                  setSelectedActivity("");
                }}
                className="pl-10 bg-slate-100 border-0 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading || (!selectedActivity && !customActivity)}
            >
              {isLoading ? "Processing..." : "Complete Check-out"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
