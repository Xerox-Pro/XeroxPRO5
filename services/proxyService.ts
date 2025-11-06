// This file is no longer in active use since the proxy logic has been moved
// to a server-side endpoint (/api/proxy). The ProxyView component now directly
// uses an iframe pointing to that endpoint. This file is kept for potential future
// client-side utility functions but its previous content is now obsolete.

export const fetchAndRewrite = async (targetUrl: string): Promise<string> => {
  console.warn("fetchAndRewrite is deprecated and should not be called.");
  // Return an empty document to avoid breaking the old component structure if accidentally called.
  return "<!DOCTYPE html><html><head></head><body></body></html>";
};
