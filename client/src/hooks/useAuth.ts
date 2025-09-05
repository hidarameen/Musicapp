import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('فشل في تسجيل الخروج');
      }
      return response.json();
    },
    onSuccess: () => {
      // مسح جميع البيانات المخزنة مؤقتاً
      queryClient.clear();
      // إعادة التوجيه للصفحة الرئيسية
      setLocation("/");
    },
    onError: (error) => {
      console.error("خطأ في تسجيل الخروج:", error);
      // حتى لو فشل، امسح البيانات المحلية ووجه للصفحة الرئيسية
      queryClient.clear();
      setLocation("/");
    }
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
