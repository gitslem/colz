import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Music,
  Briefcase,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArtistProfile, User as UserType, Project } from "@shared/schema";
import { ProjectMediaDisplay } from "@/components/ProjectMediaDisplay";

export default function ArtistDetail() {
  const [, params] = useRoute("/artists/:id");
  const [, setLocation] = useLocation();

  const { data: artist, isLoading: artistLoading } = useQuery<
    ArtistProfile & { user: UserType }
  >({
    queryKey: ["/api/artists", params?.id],
    enabled: !!params?.id,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/artists", params?.id, "projects"],
    enabled: !!params?.id,
  });

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="mt-4 h-24 w-full" />
          <Skeleton className="mt-8 h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Artist not found</p>
          <Button className="mt-4" onClick={() => setLocation("/discover")}>
            Back to Discover
          </Button>
        </Card>
      </div>
    );
  }

  const getUserInitials = () => {
    if (artist.user.firstName && artist.user.lastName) {
      return `${artist.user.firstName[0]}${artist.user.lastName[0]}`;
    }
    return artist.user.email?.[0]?.toUpperCase() || "A";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/discover")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-16 w-16 border-2">
                <AvatarImage src={artist.user.profileImageUrl || undefined} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-2xl font-bold sm:text-3xl line-clamp-1">
                  {artist.user.firstName && artist.user.lastName
                    ? `${artist.user.firstName} ${artist.user.lastName}`
                    : artist.user.email}
                </h1>
                {artist.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {artist.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">About</h2>
            {artist.bio ? (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {artist.bio}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                No bio provided yet
              </p>
            )}

            {artist.genres && artist.genres.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre, idx) => (
                    <Badge key={idx} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {artist.skills && artist.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artist.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {artist.website && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Website
                </h3>
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-website"
                >
                  {artist.website}
                </a>
              </div>
            )}
          </Card>

          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6">Projects</h2>
            {projectsLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="group cursor-pointer overflow-hidden hover-elevate"
                    onClick={() => setLocation(`/projects/${project.id}`)}
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="relative aspect-video bg-muted">
                      <ProjectMediaDisplay project={project} />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-lg font-semibold line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.genres.slice(0, 2).map((genre, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-serif text-lg font-semibold">
                  No projects yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This artist hasn't shared any projects
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
