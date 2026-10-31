"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { client } from "@/features/tenant-system/access-control/tenant-auth/api/client";
import type {
  Actor,
  FirstAdmin,
  PasswordChange,
} from "@/features/tenant-system/access-control/tenant-auth/types";

type Status = "loading" | "anon" | "ready";

type SessionContextValue = {
  status: Status;
  actor: Actor | null;
  needsSetup: boolean;
  idleMinutes: number;
  signIn: (username: string, password: string) => Promise<Actor>;
  createFirstAdmin: (input: FirstAdmin) => Promise<Actor>;
  changePassword: (input: PasswordChange) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [actor, setActor] = useState<Actor | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [idleMinutes, setIdleMinutes] = useState(30);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const probe = await client.setup(signal);
      setNeedsSetup(probe.needsSetup);
      setIdleMinutes(probe.idleMinutes);
      const current = await client.session(signal);
      setActor(current.actor);
      setStatus("ready");
    } catch {
      if (signal?.aborted) return;
      setActor(null);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Deferred so the probe resolves outside the effect body and cannot cause
    // a cascading render while React is committing.
    const timer = setTimeout(() => void load(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  const signIn = useCallback(async (username: string, password: string) => {
    const signed = await client.login(username, password);
    setActor(signed.actor);
    setNeedsSetup(false);
    setStatus("ready");
    return signed.actor;
  }, []);

  const createFirstAdmin = useCallback(
    async (input: FirstAdmin) => {
      await client.createFirstAdmin(input);
      return signIn(input.username, input.password);
    },
    [signIn],
  );

  const changePassword = useCallback(async (input: PasswordChange) => {
    await client.changePassword(input);
    setActor((current) =>
      current ? { ...current, mustChangePassword: false } : current,
    );
  }, []);

  const signOut = useCallback(async () => {
    try {
      await client.logout();
    } finally {
      setActor(null);
      setStatus("anon");
    }
  }, []);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo(
    () => ({
      status,
      actor,
      needsSetup,
      idleMinutes,
      signIn,
      createFirstAdmin,
      changePassword,
      signOut,
      refresh,
    }),
    [
      status,
      actor,
      needsSetup,
      idleMinutes,
      signIn,
      createFirstAdmin,
      changePassword,
      signOut,
      refresh,
    ],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession cần SessionProvider ở gốc ứng dụng.");
  return value;
}
