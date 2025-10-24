import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Send,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OpportunityDetail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/opportunities/:id");
  const [, setLocation] = useLocation();
  const [coverLetter, setCoverLetter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: opportunity, isLoading } = useQuery<
    Opportunity & { label: { companyName: string; logoUrl: string | null; website: string | null } }
  >({
    queryKey: ["/api/opportunities", params?.id],
    enabled: !!params?.id,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { coverLetter: string }) => {
      return await apiRequest("POST", `/api/opportunities/${params?.id}/apply`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities", params?.id] });
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      setIsDialogOpen(false);
      setCoverLetter("");
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

  const handleApply = () => {
    applyMutation.mutate({ coverLetter });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="mt-4 h-24 w-full" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Opportunity not found</p>
          <Button className="mt-4" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/discover")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl font-bold sm:text-3xl line-clamp-1">
                {opportunity.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {opportunity.label.companyName}
              </p>
            </div>
            {user?.role === "artist" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-apply">
                    <Send className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply to Opportunity</DialogTitle>
                    <DialogDescription>
                      Submit your application for this opportunity
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="coverLetter">Cover Letter</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell them why you're a great fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className="mt-2"
                        data-testid="input-cover-letter"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-apply">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        data-testid="button-submit-application"
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-card">
                {opportunity.label.logoUrl ? (
                  <img
                    src={opportunity.label.logoUrl}
                    alt={opportunity.label.companyName}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-2xl font-semibold">
                  {opportunity.label.companyName}
                </h2>
                {opportunity.label.website && (
                  <a
                    href={opportunity.label.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{opportunity.status}</Badge>
                  {opportunity.compensation && (
                    <Badge variant="outline" className="gap-2">
                      <DollarSign className="h-3 w-3" />
                      {opportunity.compensation}
                    </Badge>
                  )}
                  {opportunity.deadline && (
                    <Badge variant="outline" className="gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-serif text-xl font-semibold">Description</h3>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {opportunity.description}
            </p>
          </Card>

          {opportunity.requiredSkills.length > 0 && (
            <Card className="p-6">
              <h3 className="font-serif text-xl font-semibold">
                Required Skills
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {opportunity.genres.length > 0 && (
            <Card className="p-6">
              <h3 className="font-serif text-xl font-semibold">Genres</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.genres.map((genre, idx) => (
                  <Badge key={idx} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
