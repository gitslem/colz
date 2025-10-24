import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Music,
  Search,
  MessageSquare,
  Briefcase,
  FileText,
  FolderOpen,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";

export function AppHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Music, show: true },
    { href: "/discover", label: "Discover", icon: Search, show: true },
    { href: "/messages", label: "Messages", icon: MessageSquare, show: true },
    { href: "/opportunities/new", label: "Post Opportunity", icon: Briefcase, show: user?.role === "label" },
    { href: "/applications", label: "Applications", icon: FileText, show: user?.role === "label" },
    { href: "/analytics", label: "Analytics", icon: BarChart3, show: user?.role === "label" },
    { href: "/projects/new", label: "Share Project", icon: FolderOpen, show: user?.role === "artist" },
  ].filter(link => link.show);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-7 w-7 text-primary" />
            <span className="font-serif text-2xl font-bold">COLZ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="button-settings"
            >
              <Link href="/settings">
                <SettingsIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="button-profile"
            >
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-settings"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-profile"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  Profile
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
