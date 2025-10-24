import { Music, Play, Video } from "lucide-react";
import type { Project } from "@shared/schema";

interface ProjectMediaDisplayProps {
  project: Pick<Project, "mediaUrl" | "mediaType" | "title">;
  showControls?: boolean;
}

export function ProjectMediaDisplay({ project, showControls = false }: ProjectMediaDisplayProps) {
  const { mediaUrl, mediaType, title } = project;

  if (!mediaUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <Music className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  switch (mediaType) {
    case 'audio':
      return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Music className="h-12 w-12 text-primary" />
          </div>
          {showControls && (
            <div className="mt-4 w-full">
              <audio 
                src={mediaUrl} 
                controls 
                className="w-full"
                data-testid="audio-preview"
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
        </div>
      );

    case 'video':
      if (showControls) {
        return (
          <div className="relative h-full bg-black">
            <video
              src={mediaUrl}
              controls
              className="h-full w-full object-contain"
              data-testid="video-preview"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
      return (
        <div className="relative h-full bg-black group">
          <video
            src={mediaUrl}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-full bg-white/90 p-4">
              <Play className="h-8 w-8 text-black" />
            </div>
          </div>
        </div>
      );

    case 'image':
    default:
      return (
        <img
          src={mediaUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      );
  }
}
