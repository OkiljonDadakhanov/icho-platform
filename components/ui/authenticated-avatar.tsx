"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AuthenticatedAvatarProps {
  /** Participant ID to fetch photo for */
  participantId: string;
  /** Whether the participant has a profile photo uploaded */
  hasPhoto: boolean;
  /** Initials to display as fallback */
  initials: string;
  /** Avatar size classes */
  className?: string;
  /** Fallback background classes */
  fallbackClassName?: string;
}

/**
 * Avatar component that loads profile photos via authenticated API endpoints.
 * Shows initials fallback while loading or if no photo is available.
 */
export function AuthenticatedAvatar({
  participantId,
  hasPhoto,
  initials,
  className,
  fallbackClassName = "bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white",
}: AuthenticatedAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!hasPhoto || !participantId) {
      setImageUrl(undefined);
      return;
    }

    let isMounted = true;
    let objectUrl: string | undefined;

    const fetchImage = async () => {
      try {
        const blob = await api.download(`/v1/participants/${participantId}/photo/download/`);
        if (isMounted && blob.size > 0) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch {
        // Silently fail - avatar will show fallback
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [participantId, hasPhoto]);

  return (
    <Avatar className={className}>
      {imageUrl && !hasError && (
        <AvatarImage src={imageUrl} onError={() => setHasError(true)} />
      )}
      <AvatarFallback className={cn("text-sm font-medium", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
