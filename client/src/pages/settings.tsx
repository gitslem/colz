import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, User, Bell, Lock, LogIn, LogOut } from "lucide-react";
import { SimpleUploader } from "@/components/SimpleUploader";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserPreferences } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationNotifications, setApplicationNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [opportunityNotifications, setOpportunityNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<string>("public");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user]);

  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.emailNotifications === 1);
      setApplicationNotifications(preferences.applicationNotifications === 1);
      setMessageNotifications(preferences.messageNotifications === 1);
      setOpportunityNotifications(preferences.opportunityNotifications === 1);
      setProfileVisibility(preferences.profileVisibility || "public");
    }
  }, [preferences]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return await apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Account updated successfully",
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

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      return await apiRequest("POST", "/api/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
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

  const handleSaveAccount = () => {
    updateUserMutation.mutate({
      firstName,
      lastName,
    });
  };

  const handleSaveNotifications = () => {
    updatePreferencesMutation.mutate({
      emailNotifications: emailNotifications ? 1 : 0,
      applicationNotifications: applicationNotifications ? 1 : 0,
      messageNotifications: messageNotifications ? 1 : 0,
      opportunityNotifications: opportunityNotifications ? 1 : 0,
    });
  };

  const handleSavePrivacy = () => {
    updatePreferencesMutation.mutate({
      profileVisibility,
    });
  };

  const handleProfileImageComplete = async (uploadURL: string) => {
    try {
      const response: any = await apiRequest("PUT", "/api/profile/image", {
        imageURL: uploadURL,
      });
      setProfileImageUrl(response.imagePath);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
            <TabsTrigger value="account" data-testid="tab-account">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              <Lock className="mr-2 h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="mt-2"
                    data-testid="input-email"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2"
                    data-testid="input-first-name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2"
                    data-testid="input-last-name"
                  />
                </div>

                <div>
                  <Label>Profile Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {profileImageUrl && (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <SimpleUploader
                      onUploadComplete={handleProfileImageComplete}
                      accept="image/*"
                      data-testid="button-upload-profile-image"
                    >
                      Change Image
                    </SimpleUploader>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveAccount}
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-account"
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Authentication</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your login sessions
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  asChild
                  data-testid="button-login"
                >
                  <a href="/api/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login Again
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  asChild
                  data-testid="button-logout"
                >
                  <a href="/api/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </a>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="application-notifications">Application Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about application status changes
                    </p>
                  </div>
                  <Switch
                    id="application-notifications"
                    checked={applicationNotifications}
                    onCheckedChange={setApplicationNotifications}
                    data-testid="switch-application-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="message-notifications">New Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch
                    id="message-notifications"
                    checked={messageNotifications}
                    onCheckedChange={setMessageNotifications}
                    data-testid="switch-message-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="opportunity-notifications">New Opportunities</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new collaboration opportunities
                    </p>
                  </div>
                  <Switch
                    id="opportunity-notifications"
                    checked={opportunityNotifications}
                    onCheckedChange={setOpportunityNotifications}
                    data-testid="switch-opportunity-notifications"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={updatePreferencesMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  {updatePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Control who can view your profile
                  </p>
                  <Select
                    value={profileVisibility}
                    onValueChange={setProfileVisibility}
                  >
                    <SelectTrigger className="w-full" data-testid="select-profile-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public" data-testid="option-public">
                        Public - Anyone can view your profile
                      </SelectItem>
                      <SelectItem value="private" data-testid="option-private">
                        Private - Only you can view your profile
                      </SelectItem>
                      <SelectItem value="connections" data-testid="option-connections">
                        Connections Only - Only people you've connected with
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSavePrivacy}
                  disabled={updatePreferencesMutation.isPending}
                  data-testid="button-save-privacy"
                >
                  {updatePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
