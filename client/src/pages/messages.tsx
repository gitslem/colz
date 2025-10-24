import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Conversation, Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type ConversationWithUser = Conversation & {
  otherUser: User;
};

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithUser[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageContent("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageContent,
    });
  };

  const getUserInitials = (u: User | undefined) => {
    if (!u) return "U";
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`;
    }
    return u.email?.[0]?.toUpperCase() || "U";
  };

  const selectedConv = conversations?.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {conversationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 flex items-center gap-3 rounded-lg hover-elevate active-elevate-2 text-left ${
                    selectedConversation === conv.id ? "bg-accent" : ""
                  }`}
                  data-testid={`conversation-${conv.id}`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.otherUser.profileImageUrl || undefined} />
                    <AvatarFallback>{getUserInitials(conv.otherUser)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.otherUser.firstName} {conv.otherUser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : "No messages"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a conversation from a user profile
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConv.otherUser.profileImageUrl || undefined} />
                <AvatarFallback>{getUserInitials(selectedConv.otherUser)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedConv.otherUser.firstName} {selectedConv.otherUser.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{selectedConv.otherUser.email}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-16 w-64" />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        data-testid={`message-${message.id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={isOwn ? user?.profileImageUrl || undefined : selectedConv.otherUser.profileImageUrl || undefined}
                          />
                          <AvatarFallback>
                            {isOwn ? getUserInitials(user) : getUserInitials(selectedConv.otherUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col gap-1 max-w-md ${isOwn ? "items-end" : ""}`}>
                          <Card className={`p-3 ${isOwn ? "bg-primary text-primary-foreground" : ""}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </Card>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt!), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="h-20 w-20 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the left to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
