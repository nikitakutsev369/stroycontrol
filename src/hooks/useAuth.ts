import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessions, admins, foremen as foremenDB } from "@/schema";
import type { User, Foreman } from "@/types";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | Foreman | null>(null);

  useEffect(() => {
    const session = sessions.get();
    if (session) {
      if (session.role === "admin" && session.userId) {
        const adminUser = admins.get();
        if (adminUser && adminUser.id === session.userId) {
          setUser(adminUser);
        }
      } else if (session.role === "foreman" && session.foremanId) {
        const foreman = foremenDB.findById(session.foremanId);
        if (foreman) {
          setUser(foreman);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    sessions.destroy();
    setUser(null);
    navigate(redirectPath);
  }, [navigate, redirectPath]);

  const refresh = useCallback(() => {
    const session = sessions.get();
    if (session) {
      if (session.role === "admin" && session.userId) {
        const adminUser = admins.get();
        if (adminUser && adminUser.id === session.userId) {
          setUser(adminUser);
        }
      } else if (session.role === "foreman" && session.foremanId) {
        const foreman = foremenDB.findById(session.foremanId);
        if (foreman) {
          setUser(foreman);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      error: null,
      logout,
      refresh,
    }),
    [user, isLoading, logout, refresh],
  );
}
