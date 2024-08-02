type Return =
  | {
      isValid: true;
    }
  | { isValid: false; reason: string };

export const isValidYoutubeURL = (string: string): Return => {
  try {
    const url = new URL(string);

    const validDomains = [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "m.youtube.com",
      "www.youtube-nocookie.com",
    ];

    if (!validDomains.includes(url.hostname)) {
      return { isValid: false, reason: "Domain is not valid" };
    }

    const videoId = extractYoutubeVideoId(string);

    return videoId
      ? { isValid: true }
      : { isValid: false, reason: "No valid videoId" };
  } catch (error) {
    return { isValid: false, reason: "Not a valid URL" };
  }
};

export const extractYoutubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?v=([\w-]{11})/, // Standard watch URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([\w-]{11})/, // Embed URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([\w-]{11})/, // Old embed URLs
    /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/, // Shortened URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([\w-]{11})/, // Shorts URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([\w-]{11})/, // Live URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\/([\w-]{11})/, // Another watch URL format
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/attribution_link\?.*v%3D([\w-]{11})/, // Attribution links
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube-nocookie\.com\/embed\/([\w-]{11})/, // No-cookie embed URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/e\/([\w-]{11})/, // /e/ URLs
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?.*v=([\w-]{11})/, // URLs with additional parameters (app, feature, etc.)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no match is found, check for the -videoId format
  const dashMatch = url.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\/-([a-zA-Z0-9_-]+)/
  );
  if (dashMatch && dashMatch[1]) {
    return dashMatch[1];
  }

  return null;
};
