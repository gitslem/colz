import {
  users,
  artistProfiles,
  labelProfiles,
  opportunities,
  projects,
  applications,
  conversations,
  messages,
  notifications,
  userPreferences,
  type User,
  type UpsertUser,
  type ArtistProfile,
  type InsertArtistProfile,
  type LabelProfile,
  type InsertLabelProfile,
  type Opportunity,
  type InsertOpportunity,
  type Project,
  type InsertProject,
  type Application,
  type InsertApplication,
  type Conversation,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type UserPreferences,
  type InsertUserPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserProfileImage(id: string, profileImageUrl: string): Promise<User>;
  updateUserDetails(id: string, data: { firstName?: string; lastName?: string }): Promise<User>;

  getArtistProfile(userId: string): Promise<ArtistProfile | undefined>;
  createOrUpdateArtistProfile(data: Omit<InsertArtistProfile, "userId">, userId: string): Promise<ArtistProfile>;
  getArtistProfiles(): Promise<ArtistProfile[]>;
  getArtistProfileById(id: string): Promise<ArtistProfile | undefined>;

  getLabelProfile(userId: string): Promise<LabelProfile | undefined>;
  createOrUpdateLabelProfile(data: Omit<InsertLabelProfile, "userId">, userId: string): Promise<LabelProfile>;
  getLabelProfiles(): Promise<LabelProfile[]>;
  getLabelProfileById(id: string): Promise<LabelProfile | undefined>;

  createOpportunity(data: InsertOpportunity): Promise<Opportunity>;
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunityById(id: string): Promise<Opportunity | undefined>;
  getOpportunitiesByLabel(labelId: string): Promise<Opportunity[]>;

  createProject(data: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  getProjectsByArtist(artistId: string): Promise<Project[]>;

  createApplication(data: InsertApplication): Promise<Application>;
  getApplicationsByOpportunity(opportunityId: string): Promise<Application[]>;
  getApplicationsByArtist(artistId: string): Promise<Application[]>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;

  getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  sendMessage(data: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<Message>;

  createNotification(data: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createOrUpdateUserPreferences(data: Omit<InsertUserPreferences, "userId">, userId: string): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfileImage(id: string, profileImageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserDetails(id: string, data: { firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getArtistProfile(userId: string): Promise<ArtistProfile | undefined> {
    const [profile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateArtistProfile(
    data: Omit<InsertArtistProfile, "userId">,
    userId: string
  ): Promise<ArtistProfile> {
    const existing = await this.getArtistProfile(userId);
    
    if (existing) {
      const [updated] = await db
        .update(artistProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(artistProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(artistProfiles)
        .values({ ...data, userId })
        .returning();
      return created;
    }
  }

  async getArtistProfiles(): Promise<ArtistProfile[]> {
    return await db.select().from(artistProfiles).orderBy(desc(artistProfiles.createdAt));
  }

  async getArtistProfileById(id: string): Promise<ArtistProfile | undefined> {
    const [profile] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.id, id));
    return profile;
  }

  async getLabelProfile(userId: string): Promise<LabelProfile | undefined> {
    const [profile] = await db
      .select()
      .from(labelProfiles)
      .where(eq(labelProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateLabelProfile(
    data: Omit<InsertLabelProfile, "userId">,
    userId: string
  ): Promise<LabelProfile> {
    const existing = await this.getLabelProfile(userId);
    
    if (existing) {
      const [updated] = await db
        .update(labelProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(labelProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(labelProfiles)
        .values({ ...data, userId })
        .returning();
      return created;
    }
  }

  async getLabelProfiles(): Promise<LabelProfile[]> {
    return await db.select().from(labelProfiles).orderBy(desc(labelProfiles.createdAt));
  }

  async getLabelProfileById(id: string): Promise<LabelProfile | undefined> {
    const [profile] = await db
      .select()
      .from(labelProfiles)
      .where(eq(labelProfiles.id, id));
    return profile;
  }

  async createOpportunity(data: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(data)
      .returning();
    return opportunity;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
  }

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id));
    return opportunity;
  }

  async getOpportunitiesByLabel(labelId: string): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.labelId, labelId))
      .orderBy(desc(opportunities.createdAt));
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(data)
      .returning();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjectsByArtist(artistId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.artistId, artistId))
      .orderBy(desc(projects.createdAt));
  }

  async createApplication(data: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(data)
      .returning();
    return application;
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.opportunityId, opportunityId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsByArtist(artistId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.artistId, artistId))
      .orderBy(desc(applications.createdAt));
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, user1Id),
            eq(conversations.participant2Id, user2Id)
          ),
          and(
            eq(conversations.participant1Id, user2Id),
            eq(conversations.participant2Id, user1Id)
          )
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        participant1Id: user1Id,
        participant2Id: user2Id,
      })
      .returning();
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
  }

  async sendMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, data.conversationId));

    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ read: 1 })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async getNotificationsByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, 0)
      ));
    return Number(result[0]?.count || 0);
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ read: 1 })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.userId, userId));
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async createOrUpdateUserPreferences(data: Omit<InsertUserPreferences, "userId">, userId: string): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ ...data, userId })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
