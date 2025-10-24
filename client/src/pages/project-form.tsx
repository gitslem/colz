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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SimpleUploader } from "@/components/SimpleUploader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  collaborators: z.number().min(1).default(1),
});

type ProjectFormData = z.infer<typeof projectSchema>;

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

export default function ProjectForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [genres, setGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      collaborators: 1,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData & { genres: string[]; mediaUrl: string }) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setLocation("/");
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

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate({
      ...data,
      genres,
      mediaUrl,
    });
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

  const handleMediaComplete = async (uploadURL: string) => {
    try {
      const response = await apiRequest("PUT", "/api/projects/media", {
        mediaURL: uploadURL,
      });
      setMediaUrl(response.mediaPath);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
              <h1 className="font-serif text-3xl font-bold">Share Project</h1>
              <p className="text-sm text-muted-foreground">
                Showcase your creative work
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
                Project Details
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
                          placeholder="e.g., Summer Nights - Pop Collaboration"
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
                          placeholder="Tell us about your project..."
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
                  name="collaborators"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Collaborators</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-collaborators"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold">Media</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a preview image, audio, or video file
              </p>
              <div className="mt-4">
                {mediaUrl ? (
                  <div className="rounded-md border p-4">
                    <p className="text-sm">Media uploaded successfully</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMediaUrl("")}
                      className="mt-2"
                      data-testid="button-remove-media"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <SimpleUploader
                    onUploadComplete={handleMediaComplete}
                    buttonClassName="w-full"
                    accept="image/*,video/*,audio/*"
                    data-testid="button-upload-media"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                  </SimpleUploader>
                )}
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
                disabled={createProjectMutation.isPending}
                data-testid="button-submit"
              >
                {createProjectMutation.isPending ? "Sharing..." : "Share Project"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
