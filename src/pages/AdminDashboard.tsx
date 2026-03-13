import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Calendar, CalendarDays, CalendarRange, Activity, ArrowDownLeft, ArrowUpRight, LogOut } from "lucide-react";
import { mockFlights, airports } from "@/data/flights";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("jamair_admin") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("jamair_admin");
    toast.info("Logged out");
    navigate("/admin");
  };

  // Simulated counters
  const counters = {
    today: mockFlights.length,
    week: mockFlights.length * 5,
    month: mockFlights.length * 22,
    year: mockFlights.length * 260,
  };

  const kpis = [
    { label: 'Today', value: counters.today, icon: Calendar, sublabel: 'flights recorded' },
    { label: 'This Week', value: counters.week, icon: CalendarDays, sublabel: 'flights recorded' },
    { label: 'This Month', value: counters.month, icon: CalendarRange, sublabel: 'flights recorded' },
    { label: 'This Year', value: counters.year, icon: Activity, sublabel: 'flights recorded' },
  ];

  const airportStats = airports.map(a => ({
    ...a,
    total: mockFlights.filter(f => f.airport === a.code).length,
    inbound: mockFlights.filter(f => f.airport === a.code && f.direction === 'inbound').length,
    outbound: mockFlights.filter(f => f.airport === a.code && f.direction === 'outbound').length,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <div className="bg-primary border-b border-primary/20">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Plane className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-primary-foreground">Admin Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/50">
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* KPI Cards */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Flight Counters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <kpi.icon className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <p className="font-display text-4xl font-bold text-card-foreground">{kpi.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Airport Breakdown */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Airport Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {airportStats.map((airport) => (
              <div key={airport.code} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display font-semibold text-card-foreground mb-1">{airport.shortName}</h3>
                <p className="text-xs text-muted-foreground mb-4">{airport.name}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-display font-bold text-card-foreground">{airport.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success" /> Inbound
                    </span>
                    <span className="font-display font-semibold text-card-foreground">{airport.inbound}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ArrowUpRight className="h-3.5 w-3.5 text-accent" /> Outbound
                    </span>
                    <span className="font-display font-semibold text-card-foreground">{airport.outbound}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
