"use client";

import React, { useState } from "react";

export type SupportedProvider = "GOOGLE_DRIVE" | "FIGMA" | "GITHUB" | "OTHER";

export interface ParsedLinkInfo {
  url: string;
  provider: SupportedProvider;
  title: string;
  description: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  embedUrl?: string;
  canEmbed: boolean;
}

export function parseResourceLink(rawUrl: string): ParsedLinkInfo {
  const url = rawUrl.trim();

  // 1. Google Drive / Docs / Sheets / Slides
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    if (url.includes("/document/d/")) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      const docId = match ? match[1] : "";
      return {
        url,
        provider: "GOOGLE_DRIVE",
        title: "Tài liệu Google Docs",
        description: docId ? `ID: ${docId}` : "Google Docs Document",
        badge: "Google Docs",
        badgeBg: "bg-blue-100 dark:bg-blue-900/30",
        badgeText: "text-blue-700 dark:text-blue-300",
        embedUrl: docId
          ? `https://docs.google.com/document/d/${docId}/preview`
          : undefined,
        canEmbed: Boolean(docId),
      };
    }
    if (url.includes("/spreadsheets/d/")) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      const sheetId = match ? match[1] : "";
      return {
        url,
        provider: "GOOGLE_DRIVE",
        title: "Bảng tính Google Sheets",
        description: sheetId ? `ID: ${sheetId}` : "Google Sheets Spreadsheet",
        badge: "Google Sheets",
        badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
        badgeText: "text-emerald-700 dark:text-emerald-300",
        embedUrl: sheetId
          ? `https://docs.google.com/spreadsheets/d/${sheetId}/preview`
          : undefined,
        canEmbed: Boolean(sheetId),
      };
    }
    if (url.includes("/presentation/d/")) {
      const match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      const slideId = match ? match[1] : "";
      return {
        url,
        provider: "GOOGLE_DRIVE",
        title: "Bản trình bày Google Slides",
        description: slideId ? `ID: ${slideId}` : "Google Slides Presentation",
        badge: "Google Slides",
        badgeBg: "bg-amber-100 dark:bg-amber-900/30",
        badgeText: "text-amber-700 dark:text-amber-300",
        embedUrl: slideId
          ? `https://docs.google.com/presentation/d/${slideId}/preview`
          : undefined,
        canEmbed: Boolean(slideId),
      };
    }
    if (url.includes("/folders/")) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const folderId = match ? match[1] : "";
      return {
        url,
        provider: "GOOGLE_DRIVE",
        title: "Thư mục Google Drive",
        description: folderId
          ? `Thư mục ID: ${folderId}`
          : "Google Drive Folder",
        badge: "Google Drive",
        badgeBg: "bg-blue-100 dark:bg-blue-900/30",
        badgeText: "text-blue-700 dark:text-blue-300",
        canEmbed: false,
      };
    }
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : "";
    return {
      url,
      provider: "GOOGLE_DRIVE",
      title: "Tệp tin Google Drive",
      description: fileId ? `File ID: ${fileId}` : "Google Drive Resource",
      badge: "Google Drive",
      badgeBg: "bg-blue-100 dark:bg-blue-900/30",
      badgeText: "text-blue-700 dark:text-blue-300",
      embedUrl: fileId
        ? `https://drive.google.com/file/d/${fileId}/preview`
        : undefined,
      canEmbed: Boolean(fileId),
    };
  }

  // 2. Figma
  if (url.includes("figma.com/")) {
    const isProto = url.includes("/proto/");
    return {
      url,
      provider: "FIGMA",
      title: isProto ? "Figma Prototype" : "Figma Design File",
      description: isProto
        ? "Bản mẫu tương tác Figma"
        : "File thiết kế giao diện Figma",
      badge: "Figma",
      badgeBg: "bg-purple-100 dark:bg-purple-900/30",
      badgeText: "text-purple-700 dark:text-purple-300",
      embedUrl: `https://www.figma.com/embed?embed_host=oneops&url=${encodeURIComponent(url)}`,
      canEmbed: true,
    };
  }

  // 3. GitHub
  if (url.includes("github.com/")) {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const parts = cleanUrl.replace("https://github.com/", "").split("/");
    const org = parts[0] || "";
    const repo = parts[1] || "";
    const type = parts[2] || "";
    const id = parts[3] || "";

    if (type === "pull") {
      return {
        url,
        provider: "GITHUB",
        title: `Pull Request #${id}`,
        description: `Kho: ${org}/${repo}`,
        badge: "GitHub PR",
        badgeBg: "bg-violet-100 dark:bg-violet-900/30",
        badgeText: "text-violet-700 dark:text-violet-300",
        canEmbed: false,
      };
    }
    if (type === "issues") {
      return {
        url,
        provider: "GITHUB",
        title: `Issue #${id}`,
        description: `Kho: ${org}/${repo}`,
        badge: "GitHub Issue",
        badgeBg: "bg-green-100 dark:bg-green-900/30",
        badgeText: "text-green-700 dark:text-green-300",
        canEmbed: false,
      };
    }
    if (org && repo) {
      return {
        url,
        provider: "GITHUB",
        title: `${org}/${repo}`,
        description: "GitHub Repository",
        badge: "GitHub",
        badgeBg: "bg-gray-100 dark:bg-gray-800",
        badgeText: "text-gray-800 dark:text-gray-200",
        canEmbed: false,
      };
    }
  }

  // 4. Other URL
  try {
    const parsed = new URL(url);
    return {
      url,
      provider: "OTHER",
      title: parsed.hostname,
      description: url,
      badge: "Link",
      badgeBg: "bg-gray-100 dark:bg-gray-800",
      badgeText: "text-gray-600 dark:text-gray-300",
      canEmbed: false,
    };
  } catch {
    return {
      url,
      provider: "OTHER",
      title: "Liên kết ngoài",
      description: url,
      badge: "Link",
      badgeBg: "bg-gray-100 dark:bg-gray-800",
      badgeText: "text-gray-600 dark:text-gray-300",
      canEmbed: false,
    };
  }
}

interface TaskLinkPreviewProps {
  url: string;
  onRemove?: () => void;
  compact?: boolean;
}

export const TaskLinkPreview: React.FC<TaskLinkPreviewProps> = ({
  url,
  onRemove,
  compact = false,
}) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const info = parseResourceLink(url);

  return (
    <div className="group relative my-1 overflow-hidden rounded-xl border border-border bg-card/60 p-2.5 transition hover:border-primary/40 hover:bg-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${info.badgeBg} ${info.badgeText}`}
          >
            {info.badge}
          </span>
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs font-medium text-foreground hover:text-primary hover:underline"
            title={info.url}
          >
            {info.title}
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {info.canEmbed && !compact && (
            <button
              type="button"
              onClick={() => setShowEmbed((prev) => !prev)}
              className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showEmbed ? "Thu gọn ▴" : "Xem trước ▾"}
            </button>
          )}

          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Mở tab mới"
          >
            ↗
          </a>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
              title="Xóa link"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!compact && info.description && (
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {info.description}
        </p>
      )}

      {showEmbed && info.embedUrl && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-black/5 dark:bg-white/5">
          <iframe
            src={info.embedUrl}
            title={info.title}
            className="h-64 w-full border-0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
