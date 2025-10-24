import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Music, Building2, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity, Project, ArtistProfile, User } from "@shared/schema";

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

export default function Discover() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "opportunities" | "projects" | "artists">("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<
    (Opportunity & { label: { companyName: string; logoUrl: string | null } })[]
  >({
    queryKey: ["/api/opportunities"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<
    (Project & { artist: { user: User } })[]
  >({
    queryKey: ["/api/projects"],
  });

  const { data: artists, isLoading: artistsLoading } = useQuery<
    (ArtistProfile & { user: User })[]
  >({
    queryKey: ["/api/artists"],
  });

  const filteredOpportunities = opportunities?.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || opp.genres.includes(selectedGenre);
    const matchesSkill = selectedSkill === "all" || opp.requiredSkills.includes(selectedSkill);
    return matchesSearch && matchesGenre && matchesSkill;
  });

  const filteredProjects = projects?.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || proj.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const filteredArtists = artists?.filter((artist) => {
    const matchesSearch =
      artist.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || artist.genres.includes(selectedGenre);
    const matchesSkill = selectedSkill === "all" || artist.skills.includes(selectedSkill);
    return matchesSearch && matchesGenre && matchesSkill;
  });

  const showOpportunities = filterType === "all" || filterType === "opportunities";
  const showProjects = filterType === "all" || filterType === "projects";
  const showArtists = filterType === "all" || filterType === "artists";

  const hasActiveFilters = selectedGenre !== "all" || selectedSkill !== "all";

  const clearFilters = () => {
    setSelectedGenre("all");
    setSelectedSkill("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold">Discover</h1>
          <p className="mt-2 text-muted-foreground">
            Find opportunities, projects, and artists
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for opportunities, projects, or artists..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-type">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="opportunities">Opportunities</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="artists">Artists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[180px]" data-testid="select-genre">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {COMMON_GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[180px]" data-testid="select-skill">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {COMMON_SKILLS.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-12">
          {showOpportunities && (
            <section>
              <h2 className="mb-6 font-serif text-2xl font-semibold">
                Opportunities
              </h2>
              {opportunitiesLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <Skeleton className="mt-4 h-6 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <div className="mt-4 flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOpportunities.map((opp) => (
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {opp.label.companyName}
                      </p>
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
                  <p className="text-muted-foreground">No opportunities found</p>
                </Card>
              )}
            </section>
          )}

          {showProjects && (
            <section>
              <h2 className="mb-6 font-serif text-2xl font-semibold">
                Projects
              </h2>
              {projectsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredProjects && filteredProjects.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer overflow-hidden hover-elevate"
                      onClick={() => setLocation(`/projects/${project.id}`)}
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="relative aspect-video bg-muted">
                        {project.mediaUrl ? (
                          <img
                            src={project.mediaUrl}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Music className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
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
                  <p className="text-muted-foreground">No projects found</p>
                </Card>
              )}
            </section>
          )}

          {showArtists && (
            <section>
              <h2 className="mb-6 font-serif text-2xl font-semibold">
                Artists
              </h2>
              {artistsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="mt-4 h-6 w-2/3" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </Card>
                  ))}
                </div>
              ) : filteredArtists && filteredArtists.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredArtists.map((artist) => (
                    <Card
                      key={artist.id}
                      className="cursor-pointer p-6 hover-elevate"
                      onClick={() => setLocation(`/artists/${artist.id}`)}
                      data-testid={`card-artist-${artist.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={artist.user.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {artist.user.firstName?.[0] || artist.user.email?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold line-clamp-1">
                            {artist.user.firstName || artist.user.email}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {artist.location || "Location not set"}
                          </p>
                        </div>
                      </div>
                      {artist.bio && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                          {artist.bio}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {artist.genres.slice(0, 3).map((genre, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {artist.genres.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{artist.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No artists found</p>
                </Card>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
