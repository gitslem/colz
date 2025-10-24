import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import type { Opportunity, Project, User as UserType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectMediaDisplay } from "@/components/ProjectMediaDisplay";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<
    (Opportunity & { label: { companyName: string; logoUrl: string | null } })[]
  >({
    queryKey: ["/api/opportunities"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<
    (Project & {
      artist: {
        user: UserType;
      };
    })[]
  >({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {user?.role === "artist"
                ? "Discover new opportunities and share your creative work"
                : "Find talented artists and manage your opportunities"}
            </p>
          </div>

          <div className="space-y-12">
            {user?.role === "artist" && (
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold">
                    Latest Opportunities
                  </h2>
                  <Button variant="ghost" asChild data-testid="link-view-all-opportunities">
                    <Link href="/discover?filter=opportunities">View All</Link>
                  </Button>
                </div>

                {opportunitiesLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <Skeleton className="mt-4 h-6 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-2/3" />
                        <div className="mt-4 flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : opportunities && opportunities.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {opportunities.slice(0, 6).map((opp) => (
                      <Card
                        key={opp.id}
                        className="cursor-pointer p-6 hover-elevate"
                        onClick={() => setLocation(`/opportunities/${opp.id}`)}
                        data-testid={`card-opportunity-${opp.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-card">
                            {opp.label.logoUrl ? (
                              <img
                                src={opp.label.logoUrl}
                                alt={opp.label.companyName}
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {opp.status}
                          </Badge>
                        </div>
                        <h3 className="mt-4 font-serif text-xl font-semibold line-clamp-1">
                          {opp.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {opp.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {opp.requiredSkills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {opp.requiredSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{opp.requiredSkills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-serif text-lg font-semibold">
                      No opportunities yet
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Check back soon for new collaboration opportunities
                    </p>
                  </Card>
                )}
              </section>
            )}

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold">
                  Featured Projects
                </h2>
                <Button variant="ghost" asChild data-testid="link-view-all-projects">
                  <Link href="/discover?filter=projects">View All</Link>
                </Button>
              </div>

              {projectsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-full" />
                        <div className="mt-4 flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.slice(0, 6).map((project) => (
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
                        <p className="mt-1 text-sm text-muted-foreground">
                          by{" "}
                          {project.artist.user.firstName ||
                            project.artist.user.email}
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
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-serif text-lg font-semibold">
                    No projects yet
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Be the first to share your creative work
                  </p>
                  {user?.role === "artist" && (
                    <Button className="mt-4" asChild>
                      <Link href="/projects/new">Share Your Project</Link>
                    </Button>
                  )}
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
