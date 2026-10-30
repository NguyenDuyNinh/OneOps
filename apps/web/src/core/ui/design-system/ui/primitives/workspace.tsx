"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Icon } from "@/core/ui/design-system/ui/primitives/icon";

type Context = { openCreate: () => void; notify: (message: string) => void };

const WorkspaceContext = createContext<Context | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider required");
  return context;
}

export function WorkspaceProvider({
  children,
  renderCreate,
}: {
  children: React.ReactNode;
  renderCreate: (close: () => void) => React.ReactNode;
}) {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const notify = useCallback((text: string) => setMessage(text), []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <WorkspaceContext.Provider
      value={{ openCreate: () => setCreating(true), notify }}
    >
      {children}
      {creating && renderCreate(() => setCreating(false))}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Đóng thông báo" onClick={() => setMessage("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}
