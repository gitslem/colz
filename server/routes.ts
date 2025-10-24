import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  const objectStorageService = new ObjectStorageService();

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      const user = await storage.updateUserDetails(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post('/api/users/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;

      if (!role || (role !== "artist" && role !== "label")) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.get('/api/profile/artist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getArtistProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile/artist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.createOrUpdateArtistProfile(req.body, userId);
      res.json(profile);
    } catch (error) {
      console.error("Error saving artist profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.get('/api/profile/label', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getLabelProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching label profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile/label', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('[LABEL PROFILE] Saving profile for user:', userId, 'Data:', req.body);
      const profile = await storage.createOrUpdateLabelProfile(req.body, userId);
      console.log('[LABEL PROFILE] Profile saved successfully:', profile);
      res.status(201).json(profile);
    } catch (error) {
      console.error("[LABEL PROFILE] Error saving label profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.get('/api/artists/:id', async (req, res) => {
    try {
      const artist = await storage.getArtistProfileById(req.params.id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      const user = await storage.getUser(artist.userId);
      res.json({ ...artist, user });
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.get('/api/artists/:id/projects', async (req, res) => {
    try {
      const projects = await storage.getProjectsByArtist(req.params.id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching artist projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const privateDir = objectStorageService.getPrivateObjectDir();
      if (!privateDir) {
        return res.status(503).json({ 
          message: "Object storage is not configured. Please set up object storage in the Object Storage tool." 
        });
      }
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put('/api/profile/image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageURL } = req.body;

      if (!imageURL) {
        return res.status(400).json({ message: "imageURL is required" });
      }

      const imagePath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageURL,
        {
          owner: userId,
          visibility: "public",
        }
      );

      await storage.updateUserProfileImage(userId, imagePath);
      res.json({ imagePath });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(500).json({ message: "Failed to set profile image" });
    }
  });

  app.put('/api/projects/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mediaURL } = req.body;

      if (!mediaURL) {
        return res.status(400).json({ message: "mediaURL is required" });
      }

      const mediaPath = await objectStorageService.trySetObjectEntityAclPolicy(
        mediaURL,
        {
          owner: userId,
          visibility: "public",
        }
      );

      res.json({ mediaPath });
    } catch (error) {
      console.error("Error setting project media:", error);
      res.status(500).json({ message: "Failed to set project media" });
    }
  });

  app.get('/api/artists', async (req, res) => {
    try {
      const profiles = await storage.getArtistProfiles();
      const profilesWithUsers = await Promise.all(
        profiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          return { ...profile, user };
        })
      );
      res.json(profilesWithUsers);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get('/api/opportunities', async (req, res) => {
    try {
      const opps = await storage.getOpportunities();
      const oppsWithLabels = await Promise.all(
        opps.map(async (opp) => {
          const label = await storage.getLabelProfileById(opp.labelId);
          return { ...opp, label };
        })
      );
      res.json(oppsWithLabels);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('[OPPORTUNITY] Creating opportunity for user:', userId);
      const labelProfile = await storage.getLabelProfile(userId);

      if (!labelProfile) {
        console.log('[OPPORTUNITY] No label profile found for user:', userId);
        return res.status(403).json({ message: "Label profile required" });
      }

      const { deadline, ...restBody } = req.body;
      console.log('[OPPORTUNITY] Creating opportunity with data:', { ...restBody, labelId: labelProfile.id });
      const opportunity = await storage.createOpportunity({
        ...restBody,
        labelId: labelProfile.id,
        deadline: deadline ? new Date(deadline) : null,
      });
      console.log('[OPPORTUNITY] Opportunity created successfully:', opportunity);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("[OPPORTUNITY] Error creating opportunity:", error);
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const opportunity = await storage.getOpportunityById(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      const label = await storage.getLabelProfileById(opportunity.labelId);
      res.json({ ...opportunity, label });
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post('/api/opportunities/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const artistProfile = await storage.getArtistProfile(userId);

      if (!artistProfile) {
        return res.status(403).json({ message: "Artist profile required" });
      }

      const application = await storage.createApplication({
        opportunityId: req.params.id,
        artistId: artistProfile.id,
        coverLetter: req.body.coverLetter || "",
      });

      const opportunity = await storage.getOpportunityById(req.params.id);
      const labelProfile = opportunity && await storage.getLabelProfileById(opportunity.labelId);
      const artist = await storage.getUser(userId);
      
      if (labelProfile && opportunity && artist) {
        await storage.createNotification({
          userId: labelProfile.userId,
          type: 'application_submitted',
          title: 'New Application',
          message: `${artist.firstName || 'Someone'} applied to "${opportunity.title}"`,
          relatedId: application.id,
          read: 0,
        });
      }

      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      const projectsWithArtists = await Promise.all(
        projects.map(async (project) => {
          const artist = await storage.getArtistProfileById(project.artistId);
          if (!artist) return null;
          const user = await storage.getUser(artist.userId);
          return { ...project, artist: { ...artist, user } };
        })
      );
      res.json(projectsWithArtists.filter(p => p !== null));
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const artistProfile = await storage.getArtistProfile(userId);

      if (!artistProfile) {
        return res.status(403).json({ message: "Artist profile required" });
      }

      const project = await storage.createProject({
        ...req.body,
        artistId: artistProfile.id,
      });
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const artist = await storage.getArtistProfileById(project.artistId);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      const user = await storage.getUser(artist.userId);
      res.json({ ...project, artist: { ...artist, user } });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const labelProfile = await storage.getLabelProfile(userId);

      if (!labelProfile) {
        return res.status(403).json({ message: "Label profile required" });
      }

      const opportunities = await storage.getOpportunitiesByLabel(labelProfile.id);
      const allApplications = [];

      for (const opp of opportunities) {
        const apps = await storage.getApplicationsByOpportunity(opp.id);
        for (const app of apps) {
          const artist = await storage.getArtistProfileById(app.artistId);
          if (artist) {
            const user = await storage.getUser(artist.userId);
            allApplications.push({
              ...app,
              artist: { ...artist, user },
              opportunity: opp,
            });
          }
        }
      }

      res.json(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(req.params.id, status);
      
      if (status === 'accepted' || status === 'rejected') {
        const artistProfile = await storage.getArtistProfileById(application.artistId);
        const opportunity = await storage.getOpportunityById(application.opportunityId);
        
        if (artistProfile && opportunity) {
          await storage.createNotification({
            userId: artistProfile.userId,
            type: `application_${status}`,
            title: status === 'accepted' ? 'Application Accepted!' : 'Application Status Update',
            message: `Your application for "${opportunity.title}" has been ${status}`,
            relatedId: application.id,
            read: 0,
          });
        }
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUser(userId);
      
      const conversationsWithParticipants = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
          const otherUser = await storage.getUser(otherUserId);
          return {
            ...conv,
            otherUser,
          };
        })
      );

      res.json(conversationsWithParticipants);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const conversation = await storage.getOrCreateConversation(currentUserId, otherUserId);
      const otherUser = await storage.getUser(otherUserId);
      
      res.json({
        ...conversation,
        otherUser,
      });
    } catch (error) {
      console.error("Error getting conversation:", error);
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });

  app.get('/api/messages/:conversationId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.conversationId;
      
      const conversations = await storage.getConversationsByUser(userId);
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        return res.status(403).json({ message: "Access denied - not a participant in this conversation" });
      }

      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId, content } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ message: "Conversation ID and content are required" });
      }

      const conversations = await storage.getConversationsByUser(userId);
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        return res.status(403).json({ message: "Access denied - not a participant in this conversation" });
      }

      const message = await storage.sendMessage({
        conversationId,
        senderId: userId,
        content,
        read: 0,
      });

      const recipientId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
      const sender = await storage.getUser(userId);
      
      await storage.createNotification({
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        message: `${sender?.firstName || 'Someone'} sent you a message`,
        relatedId: conversationId,
        read: 0,
      });

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notification = await storage.markNotificationAsRead(req.params.id, userId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found or access denied" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      
      if (!prefs) {
        const defaultPrefs = await storage.createOrUpdateUserPreferences({
          emailNotifications: 1,
          applicationNotifications: 1,
          messageNotifications: 1,
          opportunityNotifications: 1,
          profileVisibility: 'public',
        }, userId);
        return res.json(defaultPrefs);
      }
      
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.createOrUpdateUserPreferences(req.body, userId);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.get('/api/analytics/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'label') {
        return res.status(403).json({ message: "Only labels can access analytics" });
      }

      const labelProfile = await storage.getLabelProfile(userId);
      if (!labelProfile) {
        return res.status(404).json({ message: "Label profile not found" });
      }

      const analytics = await storage.getOpportunityAnalytics(labelProfile.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching opportunity analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/application-breakdown', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'label') {
        return res.status(403).json({ message: "Only labels can access analytics" });
      }

      const labelProfile = await storage.getLabelProfile(userId);
      if (!labelProfile) {
        return res.status(404).json({ message: "Label profile not found" });
      }

      const breakdown = await storage.getApplicationStatusBreakdown(labelProfile.id);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching application breakdown:", error);
      res.status(500).json({ message: "Failed to fetch application breakdown" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
