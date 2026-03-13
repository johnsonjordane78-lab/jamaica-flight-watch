import { Link, useLocation } from "react-router-dom";
import { Plane, Shield } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-primary/20 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-accent" />
          <span className="font-display font-bold text-primary-foreground tracking-wide text-lg">
            JamAir<span className="text-accent">Tracker</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              !isAdmin ? 'text-accent' : 'text-primary-foreground/70 hover:text-primary-foreground'
            }`}
          >
            Live Tracker
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isAdmin ? 'text-accent' : 'text-primary-foreground/70 hover:text-primary-foreground'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
