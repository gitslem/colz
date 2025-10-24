import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Building2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"artist" | "label" | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const selectRoleMutation = useMutation({
    mutationFn: async (role: "artist" | "label") => {
      return await apiRequest("POST", "/api/users/role", { role });
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

  const handleContinue = () => {
    if (selectedRole) {
      selectRoleMutation.mutate(selectedRole);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">
            Welcome to COLZ
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

        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={!selectedRole || selectRoleMutation.isPending}
            onClick={handleContinue}
            data-testid="button-continue"
          >
            {selectRoleMutation.isPending ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
