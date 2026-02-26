import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/**
 * Hook to load images that require authentication.
 * Fetches the image via the API with JWT auth and creates a blob URL.
 *
 * @param downloadEndpoint - The API endpoint to download the image (e.g., /v1/participants/{id}/photo/download/)
 * @param enabled - Whether to fetch the image (default: true)
 * @returns Object with imageUrl (blob URL or undefined) and loading state
 */
export function useAuthenticatedImage(
  downloadEndpoint: string | null | undefined,
  enabled: boolean = true
): { imageUrl: string | undefined; isLoading: boolean } {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!downloadEndpoint || !enabled) {
      setImageUrl(undefined);
      return;
    }

    let isMounted = true;
    let objectUrl: string | undefined;

    const fetchImage = async () => {
      setIsLoading(true);
      try {
        const blob = await api.download(downloadEndpoint);
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (error) {
        // Silently fail - avatar will show fallback
        if (isMounted) {
          setImageUrl(undefined);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
  }, [downloadEndpoint, enabled]);

  return { imageUrl, isLoading };
}
