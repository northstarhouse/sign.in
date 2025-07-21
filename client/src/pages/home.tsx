import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, UserPlus, Clock, Table, Settings } from "lucide-react";
import { api } from "@/lib/api";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: api.stats.getDashboard,
  });

  const features = [
    {
      href: "/volunteers",
      icon: Users,
      title: "Volunteer Check-In",
      description: "Sign in and out volunteers",
      gradient: "gradient-blue",
    },
    {
      href: "/guests",
      icon: UserPlus,
      title: "Guest Registration",
      description: "Register new guests",
      gradient: "gradient-emerald",
    },
    {
      href: "/employees",
      icon: Clock,
      title: "Employee Clock",
      description: "Time tracking for staff",
      gradient: "gradient-purple",
    },
    {
      href: "/manage",
      icon: Settings,
      title: "Manage & Data",
      description: "Manage people and view data",
      gradient: "gradient-rose",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Check-In Dashboard</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white text-2xl" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Check into the North Star House!</h2>
          <p className="text-slate-600">Quick access to all check-in features</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <button className={`gradient-button ${feature.gradient} p-6 rounded-xl w-full`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <feature.icon size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </div>
              </button>
            </Link>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="bg-slate-100 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-slate-800 mb-3">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                {stats?.volunteers || 0}
              </div>
              <div className="text-xs text-slate-600">Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {stats?.guests || 0}
              </div>
              <div className="text-xs text-slate-600">Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-700">
                {stats?.employees || 0}
              </div>
              <div className="text-xs text-slate-600">Staff</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
