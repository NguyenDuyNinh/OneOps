"use client";

import { clearSession, getCurrentUser, type AuthenticatedUser } from "@/features/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BaseAvatar } from "../ui/Avatar";
import {
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Grid,
  Home,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Search,
} from "../ui/icons";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  reminderCount: number;
  onOpenQuickReminder: () => void;
}

export const BaseTopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  reminderCount,
  onOpenQuickReminder,
}) => {
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSignOut = () => {
    clearSession();
    setShowUserMenu(false);
    router.replace("/signin");
  };

  return (
    <header className="relative z-30 flex h-[42px] shrink-0 items-center justify-between bg-[#14499D] px-3 text-white select-none">
      {/* Zone 1: Brand mark — Giữ nguyên logo Hoàng Hà */}
      <div className="flex shrink-0 items-center gap-2">
        <a
          href="#dashboard"
          onClick={(e) => e.preventDefault()}
          className="flex shrink-0 items-center rounded-[4px] bg-white px-2 py-0.5 whitespace-nowrap shadow-2xs transition-opacity hover:opacity-95"
        >
          <Image
            width={108}
            height={26}
            priority
            src="/images/logo/logo-horizontal.webp"
            alt="Hoàng Hà"
            className="h-[24px] w-auto object-contain"
          />
        </a>
      </div>

      {/* Zone 2: Centered Search input */}
      <div className="mx-4 max-w-[360px] flex-1">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-white/75" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm"
            aria-label="Tìm kiếm công việc"
            className="h-[28px] w-full rounded-[4px] bg-[#3664AD] pr-3 pl-8 text-[12.5px] text-white placeholder-white/75 transition-colors outline-none hover:bg-[#3E6CB5] focus:bg-white focus:text-slate-900"
          />
        </div>
      </div>

      {/* Zone 3: Right actions (Nhắc việc pill, Bell, Quick notes, Avatar) */}
      <div className="flex shrink-0 items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenQuickReminder}
          className="relative flex h-[27px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/60 bg-[#2557A7] px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors hover:bg-[#2F62B2]"
        >
          <CheckCircle2 className="h-3.5 w-3.5 fill-white/20 text-white" />
          <span>Nhắc việc</span>
          <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[17px] items-center justify-center rounded-full bg-[#E53935] px-1 text-[10px] leading-none font-bold text-white tabular-nums shadow-2xs">
            {reminderCount}
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotif((prev) => !prev)}
            aria-label="Thông báo"
            className="flex cursor-pointer items-center justify-center p-1 text-white/90 transition-colors hover:text-white"
          >
            <Bell className="h-4 w-4 fill-white" />
          </button>
          {showNotif && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-lg">
              <div className="mb-1.5 flex items-center justify-between font-semibold text-slate-900">
                <span>Thông báo mới</span>
                <button
                  type="button"
                  onClick={() => setShowNotif(false)}
                  className="cursor-pointer text-[11px] text-blue-600 hover:underline"
                >
                  Đóng
                </button>
              </div>
              <p className="border-b border-slate-100 py-1 text-slate-600">
                Nguyễn Hoàng Long vừa cập nhật tiến độ công việc tại DỰ ÁN TĂNG TRƯỞNG.
              </p>
              <p className="py-1 text-slate-600">
                Có 6 đề xuất quan trọng đang chờ bạn phê duyệt trên Base Request.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenQuickReminder}
          aria-label="Tài liệu và ghi chú nhanh"
          className="flex cursor-pointer items-center justify-center p-1 text-white/90 transition-colors hover:text-white"
        >
          <Layers className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu((prev) => !prev);
              setShowNotif(false);
            }}
            aria-label="Tài khoản người dùng"
            title="Tài khoản & Đăng xuất"
            className="cursor-pointer rounded-full ring-1 ring-white/40 transition-all hover:ring-white flex items-center justify-center"
          >
            <BaseAvatar type="male_suit" size={26} />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-60 rounded-[6px] border border-slate-200 bg-white py-2 text-xs text-slate-800 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-3.5 pb-2.5">
                  <BaseAvatar type="male_suit" size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-slate-900">
                      {currentUser?.name || "Trần Tuấn Anh Nghĩa"}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {currentUser?.email || "manager@oneops.vn"}
                    </div>
                  </div>
                </div>

                <div className="px-1.5 pt-1.5">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-[12.5px] font-semibold text-[#DC2626] transition-colors hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Đăng xuất (Sign out)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

interface LeftRailProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
}

export const BaseLeftRail: React.FC<LeftRailProps> = ({
  activeNav,
  onSelectNav,
}) => {
  const navItems = [
    {
      id: "home",
      label: "Trang chủ",
      renderIcon: (active: boolean) => (
        <div
          className={`flex h-6 w-6 items-center justify-center rounded ${
            active ? "text-[#14499D]" : "text-[#6B7280]"
          }`}
        >
          <Home className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>
      ),
    },
    {
      id: "messages",
      label: "Tin nhắn",
      renderIcon: () => (
        <div className="flex h-6 w-6 items-center justify-center text-[#6B7280]">
          <MessageSquare className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </div>
      ),
    },
    {
      id: "calendar",
      label: "Lịch",
      renderIcon: () => (
        <div className="flex h-6 w-6 items-center justify-center text-[#6B7280]">
          <Calendar className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </div>
      ),
    },
    {
      id: "notes",
      label: "Ghi chú",
      renderIcon: () => (
        <div className="flex h-6 w-6 items-center justify-center text-[#6B7280]">
          <FileText className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </div>
      ),
    },
    {
      id: "wework",
      label: "Wework",
      renderIcon: () => (
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#6C757D] text-[10px] font-bold text-white">
          W
        </div>
      ),
    },
    {
      id: "request",
      label: "Request",
      renderIcon: () => (
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#6C757D] text-white">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 12V8C4 5.5 5.8 3.5 8 3.5C10.2 3.5 12 5.5 12 8V12"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "workflow",
      label: "Workflow",
      renderIcon: () => (
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#6C757D] text-[9px] font-bold text-white italic">
          wf
        </div>
      ),
    },
    {
      id: "goal",
      label: "Goal",
      renderIcon: () => (
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#6C757D] text-white">
          <div className="flex h-2.5 items-end gap-[1.5px]">
            <span className="h-1.5 w-[2px] rounded-xs bg-white" />
            <span className="h-2.5 w-[2px] rounded-xs bg-white" />
            <span className="h-2 w-[2px] rounded-xs bg-white" />
          </div>
        </div>
      ),
    },
    {
      id: "meeting",
      label: "Meeting",
      renderIcon: () => (
        <div className="flex h-[20px] w-[20px] items-center justify-center rounded-[5px] bg-[#6C757D] text-white">
          <div className="grid grid-cols-3 gap-[2px]">
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
            <span className="h-[2px] w-[2px] rounded-full bg-white" />
          </div>
        </div>
      ),
    },
    {
      id: "more",
      label: "Thêm",
      renderIcon: () => (
        <div className="flex h-6 w-6 items-center justify-center text-[#6B7280]">
          <MoreHorizontal className="h-4 w-4" />
        </div>
      ),
    },
  ];

  return (
    <aside
      aria-label="Thanh điều hướng chính"
      className="flex w-[56px] shrink-0 flex-col justify-between border-r border-[#E5E7EB] bg-[#F5F6F8] py-2 select-none"
    >
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                isActive
                  ? "font-semibold text-[#14499D]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {item.renderIcon(isActive)}
              <span className="text-[10px] leading-tight tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center border-t border-gray-200/70 pt-2">
        <button
          type="button"
          onClick={() => onSelectNav("apps")}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[#6B7280] hover:text-[#111827]"
        >
          <Grid className="h-4 w-4" />
          <span className="text-[9.5px] leading-tight whitespace-nowrap">Ứng dụng</span>
        </button>
      </div>
    </aside>
  );
};

