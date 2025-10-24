import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, X, Calendar } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  compensation: z.string().optional(),
  deadline: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const COMMON_GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
];

const COMMON_SKILLS = [
  "Vocals",
  "Guitar",
  "Piano",
  "Drums",
  "Production",
  "Mixing",
  "Songwriting",
  "DJ",
];

export default function OpportunityForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newGenre, setNewGenre] = useState("");

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      compensation: "",
      deadline: "",
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormData & { requiredSkills: string[]; genres: string[] }) => {
      const response = await apiRequest("POST", "/api/opportunities", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      if (data?.id) {
        setLocation(`/opportunities/${data.id}`);
      } else {
        setLocation("/discover");
      }
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

  const onSubmit = (data: OpportunityFormData) => {
    createOpportunityMutation.mutate({
      ...data,
      requiredSkills,
      genres,
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres([...genres, genre]);
    }
    setNewGenre("");
  };

  const removeGenre = (genre: string) => {
    setGenres(genres.filter((g) => g !== genre));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Create Opportunity</h1>
              <p className="text-sm text-muted-foreground">
                Post a new collaboration opportunity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold">
                Basic Information
              </h2>
              <div className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Looking for Vocalist for Pop Track"
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the opportunity in detail..."
                          rows={6}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compensation</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., $500, Revenue Share, Negotiable"
                          data-testid="input-compensation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="date"
                            className="pr-10"
                            data-testid="input-deadline"
                          />
                          <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold">
                Required Skills
              </h2>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-2">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover-elevate rounded-sm"
                        data-testid={`button-remove-skill-${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Add a required skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(newSkill);
                      }
                    }}
                    list="skills-list"
                    data-testid="input-new-skill"
                  />
                  <datalist id="skills-list">
                    {COMMON_SKILLS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <Button type="button" onClick={() => addSkill(newSkill)} data-testid="button-add-skill">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold">Genres</h2>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="gap-2">
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="hover-elevate rounded-sm"
                        data-testid={`button-remove-genre-${genre}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Add a genre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGenre(newGenre);
                      }
                    }}
                    list="genres-list"
                    data-testid="input-new-genre"
                  />
                  <datalist id="genres-list">
                    {COMMON_GENRES.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                  <Button type="button" onClick={() => addGenre(newGenre)} data-testid="button-add-genre">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOpportunityMutation.isPending}
                data-testid="button-submit"
              >
                {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
