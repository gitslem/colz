import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Check, X, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Application, Opportunity } from "@shared/schema";

interface ApplicationWithDetails extends Application {
  artist?: {
    id: string;
    userId: string;
    bio?: string;
    location?: string;
    genres?: string[];
    skills?: string[];
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
  opportunity?: Opportunity;
}

export default function Applications() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: allApplications = [], isLoading: loadingApplications } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
    enabled: opportunities.length > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application status updated",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = loadingOpportunities || loadingApplications;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-serif text-3xl font-bold">Applications</h1>
                <p className="text-sm text-muted-foreground">Manage artist applications</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const grouped = allApplications.reduce((acc, app) => {
    const oppId = app.opportunityId;
    if (!acc[oppId]) {
      acc[oppId] = [];
    }
    acc[oppId].push(app);
    return acc;
  }, {} as Record<string, ApplicationWithDetails[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Applications</h1>
              <p className="text-sm text-muted-foreground">Manage artist applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {allApplications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No applications yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Artists will see your opportunities and apply when interested
              </p>
            </div>
          </Card>
        ) : (
          opportunities.map((opp) => {
            const apps = grouped[opp.id] || [];
            if (apps.length === 0) return null;

            return (
              <div key={opp.id}>
                <div className="mb-4">
                  <h2 className="font-serif text-2xl font-semibold">{opp.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="grid gap-4">
                  {apps.map((app) => (
                    <Card key={app.id} className="p-6" data-testid={`card-application-${app.id}`}>
                      <div className="flex items-start gap-6">
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage src={app.artist?.user?.profileImageUrl || undefined} />
                          <AvatarFallback className="text-lg">
                            {app.artist?.user?.firstName?.[0] || app.artist?.user?.email?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg">
                                {app.artist?.user?.firstName || app.artist?.user?.email}
                              </h3>
                              {app.artist?.location && (
                                <p className="text-sm text-muted-foreground">{app.artist.location}</p>
                              )}
                            </div>
                            <Badge
                              variant={
                                app.status === "accepted"
                                  ? "default"
                                  : app.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              data-testid={`badge-status-${app.id}`}
                            >
                              {app.status}
                            </Badge>
                          </div>

                          {app.artist?.genres && app.artist.genres.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {app.artist.genres.map((genre) => (
                                <Badge key={genre} variant="outline">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {app.coverLetter && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Cover Letter</p>
                              <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </div>

                          {app.status === "pending" && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: app.id, status: "accepted" })
                                }
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-accept-${app.id}`}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: app.id, status: "rejected" })
                                }
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-reject-${app.id}`}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
