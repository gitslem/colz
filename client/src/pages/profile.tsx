import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, X, Upload, ExternalLink } from "lucide-react";
import type { ArtistProfile, LabelProfile } from "@shared/schema";
import { SimpleUploader } from "@/components/SimpleUploader";
import { isUnauthorizedError } from "@/lib/authUtils";

const COMMON_GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "R&B",
  "Country",
  "Blues",
  "Reggae",
];

const COMMON_SKILLS = [
  "Vocals",
  "Guitar",
  "Piano",
  "Drums",
  "Bass",
  "Production",
  "Mixing",
  "Mastering",
  "Songwriting",
  "DJ",
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: artistProfile } = useQuery<ArtistProfile>({
    queryKey: ["/api/profile/artist"],
    enabled: user?.role === "artist",
    retry: false,
  });

  const { data: labelProfile } = useQuery<LabelProfile>({
    queryKey: ["/api/profile/label"],
    enabled: user?.role === "label",
    retry: false,
  });

  const [bio, setBio] = useState("");
  const [location, setLocationField] = useState("");
  const [website, setWebsite] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [about, setAbout] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [portfolioSamples, setPortfolioSamples] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role === "artist" && artistProfile) {
      setBio(artistProfile.bio || "");
      setLocationField(artistProfile.location || "");
      setWebsite(artistProfile.website || "");
      setGenres(artistProfile.genres || []);
      setSkills(artistProfile.skills || []);
      setPortfolioSamples(artistProfile.portfolioSamples || []);
    } else if (user?.role === "label" && labelProfile) {
      setCompanyName(labelProfile.companyName || "");
      setAbout(labelProfile.about || "");
      setWebsite(labelProfile.website || "");
      setLocationField(labelProfile.location || "");
      setLogoUrl(labelProfile.logoUrl || "");
    }
  }, [user, artistProfile, labelProfile]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (user?.role === "artist") {
        return await apiRequest("POST", "/api/profile/artist", data);
      } else {
        return await apiRequest("POST", "/api/profile/label", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/artist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/label"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
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

  const handleSave = () => {
    if (user?.role === "artist") {
      saveProfileMutation.mutate({
        bio,
        location,
        website,
        genres,
        skills,
        portfolioSamples,
      });
    } else if (user?.role === "label") {
      if (!companyName.trim()) {
        toast({
          title: "Error",
          description: "Company name is required",
          variant: "destructive",
        });
        return;
      }
      saveProfileMutation.mutate({
        companyName,
        about,
        website,
        location,
        logoUrl,
      });
    }
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

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleProfileImageComplete = async (uploadURL: string) => {
    try {
      const response = await apiRequest("PUT", "/api/profile/image", {
        imageURL: uploadURL,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePortfolioComplete = async (uploadURL: string) => {
    setPortfolioSamples([...portfolioSamples, uploadURL]);
    toast({
      title: "Success",
      description: "Portfolio sample added. Remember to save your profile.",
    });
  };

  const removePortfolioSample = (url: string) => {
    setPortfolioSamples(portfolioSamples.filter((s) => s !== url));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your {user?.role} profile
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">
              Profile Picture
            </h2>
            <div className="mt-4 flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <SimpleUploader
                onUploadComplete={handleProfileImageComplete}
                accept="image/*"
                data-testid="button-upload-profile-image"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Photo
              </SimpleUploader>
            </div>
          </Card>

          {user?.role === "artist" ? (
            <>
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold">
                  Basic Information
                </h2>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-2"
                      rows={4}
                      data-testid="input-bio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Los Angeles, CA"
                      value={location}
                      onChange={(e) => setLocationField(e.target.value)}
                      className="mt-2"
                      data-testid="input-location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://your-website.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="mt-2"
                      data-testid="input-website"
                    />
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
                    <Button onClick={() => addGenre(newGenre)} data-testid="button-add-genre">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold">Skills</h2>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-2">
                        {skill}
                        <button
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
                      placeholder="Add a skill"
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
                    <Button onClick={() => addSkill(newSkill)} data-testid="button-add-skill">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold">
                  Portfolio Samples
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload samples of your work (images, audio, video)
                </p>
                <div className="mt-4 space-y-4">
                  {portfolioSamples.map((sample, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">Sample {idx + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePortfolioSample(sample)}
                        data-testid={`button-remove-portfolio-${idx}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <SimpleUploader
                    onUploadComplete={handlePortfolioComplete}
                    buttonClassName="w-full"
                    accept="image/*,video/*,audio/*"
                    data-testid="button-upload-portfolio"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Portfolio Sample
                  </SimpleUploader>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold">
                Label Information
              </h2>
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-2"
                    required
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    placeholder="Tell us about your label..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="mt-2"
                    rows={4}
                    data-testid="input-about"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    value={location}
                    onChange={(e) => setLocationField(e.target.value)}
                    className="mt-2"
                    data-testid="input-location"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-2"
                    data-testid="input-website"
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveProfileMutation.isPending}
              data-testid="button-save"
            >
              {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
