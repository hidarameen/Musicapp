import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
      retry: (failureCount, error) => {
        // Retry network errors up to 2 times
        if (failureCount < 2 && error.message.includes('fetch')) {
          return true;
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "online",
      // Enable background refetching for better UX
      refetchOnMount: "always",
      refetchOnReconnect: "always",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

// Helper function for prefetching
export const prefetchData = async (queryKey: string[]) => {
  return queryClient.prefetchQuery({
    queryKey,
    staleTime: 10 * 60 * 1000,
  });
};
