import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User as UserIcon, Music, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectMediaDisplay } from "@/components/ProjectMediaDisplay";
import type { Project, User as UserType } from "@shared/schema";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();

  const { data: project, isLoading } = useQuery<
    Project & {
      artist: {
        user: UserType;
        bio: string | null;
        location: string | null;
      };
    }
  >({
    queryKey: ["/api/projects", params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="mt-4 h-96 w-full" />
          <Skeleton className="mt-4 h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Project not found</p>
          <Button className="mt-4" onClick={() => setLocation("/discover")}>
            Back to Discover
          </Button>
        </Card>
      </div>
    );
  }

  const getUserInitials = () => {
    const user = project.artist.user;
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/discover")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl font-bold sm:text-3xl line-clamp-1">
                {project.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                by {project.artist.user.firstName || project.artist.user.email}
              </p>
            </div>
            {project.mediaType && (
              <Badge variant="secondary" className="gap-2">
                {project.mediaType === 'audio' && <Music className="h-3 w-3" />}
                {project.mediaType === 'video' && <Video className="h-3 w-3" />}
                {project.mediaType}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <ProjectMediaDisplay project={project} showControls={true} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={project.artist.user.profileImageUrl || undefined} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl font-semibold">
                  {project.artist.user.firstName && project.artist.user.lastName
                    ? `${project.artist.user.firstName} ${project.artist.user.lastName}`
                    : project.artist.user.email}
                </h2>
                {project.artist.location && (
                  <p className="text-sm text-muted-foreground">
                    {project.artist.location}
                  </p>
                )}
                {project.artist.bio && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.artist.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-serif text-xl font-semibold">About This Project</h3>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </Card>

          {project.genres && project.genres.length > 0 && (
            <Card className="p-6">
              <h3 className="font-serif text-xl font-semibold">Genres</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.genres.map((genre, idx) => (
                  <Badge key={idx} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {project.mediaDuration && (
            <Card className="p-6">
              <h3 className="font-serif text-xl font-semibold">Duration</h3>
              <p className="mt-2 text-muted-foreground">
                {Math.floor(project.mediaDuration / 60)}:{String(Math.floor(project.mediaDuration % 60)).padStart(2, '0')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
