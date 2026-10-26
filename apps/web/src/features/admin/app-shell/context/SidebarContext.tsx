"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  /** Panel trang con (cạnh rail) đang mở — PUSH nội dung, không đè. */
  isSubmenuOpen: boolean;
  isMobileOpen: boolean;
  /** Index section user bấm gần nhất trên rail; null = derive theo route hiện tại. */
  selectedSection: number | null;
  toggleSubmenuPanel: () => void;
  openSubmenuPanel: () => void;
  closeSubmenuPanel: () => void;
  setSelectedSection: (index: number) => void;
  toggleMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubmenuPanel = () => setIsSubmenuOpen((prev) => !prev);
  const openSubmenuPanel = () => setIsSubmenuOpen(true);
  const closeSubmenuPanel = () => setIsSubmenuOpen(false);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isSubmenuOpen,
        isMobileOpen,
        selectedSection,
        toggleSubmenuPanel,
        openSubmenuPanel,
        closeSubmenuPanel,
        setSelectedSection,
        toggleMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
