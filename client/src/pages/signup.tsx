import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Building2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Signup() {
  const [step, setStep] = useState<"info" | "role">("info");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"artist" | "label" | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const updateUserMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/user", data);
      return await response.json();
    },
    onSuccess: () => {
      setStep("role");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectRoleMutation = useMutation({
    mutationFn: async (role: "artist" | "label") => {
      const response = await apiRequest("POST", "/api/users/role", { role });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      updateUserMutation.mutate({ firstName, lastName });
    }
  };

  const handleRoleSubmit = () => {
    if (selectedRole) {
      selectRoleMutation.mutate(selectedRole);
    }
  };

  if (step === "info") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-10 w-10 text-primary" />
              <span className="font-serif text-3xl font-bold">COLZ</span>
            </div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">
              Welcome to COLZ
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Let's get to know you
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                  data-testid="input-first-name"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                  data-testid="input-last-name"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!firstName.trim() || !lastName.trim() || updateUserMutation.isPending}
                data-testid="button-continue-info"
              >
                {updateUserMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            Welcome, {firstName}!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card
            className={`cursor-pointer p-8 transition-all hover-elevate ${
              selectedRole === "artist" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedRole("artist")}
            data-testid="card-role-artist"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
              {selectedRole === "artist" && (
                <CheckCircle2 className="h-6 w-6 text-primary" data-testid="icon-selected-artist" />
              )}
            </div>
            <h2 className="mt-4 font-serif text-2xl font-semibold">
              I'm an Artist
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Showcase your portfolio, find collaboration opportunities, 
              and connect with labels and other artists.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Create a stunning artist profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Upload portfolio samples</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Apply to opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Share your projects</span>
              </li>
            </ul>
          </Card>

          <Card
            className={`cursor-pointer p-8 transition-all hover-elevate ${
              selectedRole === "label" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedRole("label")}
            data-testid="card-role-label"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              {selectedRole === "label" && (
                <CheckCircle2 className="h-6 w-6 text-primary" data-testid="icon-selected-label" />
              )}
            </div>
            <h2 className="mt-4 font-serif text-2xl font-semibold">
              I'm a Label
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Post opportunities, discover talented artists, 
              and manage applications all in one place.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Create a professional label profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Post collaboration opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Browse artist profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Manage applications</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep("info")}
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            size="lg"
            disabled={!selectedRole || selectRoleMutation.isPending}
            onClick={handleRoleSubmit}
            data-testid="button-continue-role"
          >
            {selectRoleMutation.isPending ? "Setting up..." : "Get Started"}
          </Button>
        </div>
      </div>
    </div>
  );
}
