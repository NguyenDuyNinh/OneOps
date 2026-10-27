'use client';

import React, { useState } from 'react';

export type SupportedProvider = 'GOOGLE_DRIVE' | 'FIGMA' | 'GITHUB' | 'OTHER';

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
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    if (url.includes('/document/d/')) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      const docId = match ? match[1] : '';
      return {
        url,
        provider: 'GOOGLE_DRIVE',
        title: 'Tài liệu Google Docs',
        description: docId ? `ID: ${docId}` : 'Google Docs Document',
        badge: 'Google Docs',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
        badgeText: 'text-blue-700 dark:text-blue-300',
        embedUrl: docId ? `https://docs.google.com/document/d/${docId}/preview` : undefined,
        canEmbed: Boolean(docId),
      };
    }
    if (url.includes('/spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      const sheetId = match ? match[1] : '';
      return {
        url,
        provider: 'GOOGLE_DRIVE',
        title: 'Bảng tính Google Sheets',
        description: sheetId ? `ID: ${sheetId}` : 'Google Sheets Spreadsheet',
        badge: 'Google Sheets',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        embedUrl: sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/preview` : undefined,
        canEmbed: Boolean(sheetId),
      };
    }
    if (url.includes('/presentation/d/')) {
      const match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      const slideId = match ? match[1] : '';
      return {
        url,
        provider: 'GOOGLE_DRIVE',
        title: 'Bản trình bày Google Slides',
        description: slideId ? `ID: ${slideId}` : 'Google Slides Presentation',
        badge: 'Google Slides',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-700 dark:text-amber-300',
        embedUrl: slideId ? `https://docs.google.com/presentation/d/${slideId}/preview` : undefined,
        canEmbed: Boolean(slideId),
      };
    }
    if (url.includes('/folders/')) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const folderId = match ? match[1] : '';
      return {
        url,
        provider: 'GOOGLE_DRIVE',
        title: 'Thư mục Google Drive',
        description: folderId ? `Thư mục ID: ${folderId}` : 'Google Drive Folder',
        badge: 'Google Drive',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
        badgeText: 'text-blue-700 dark:text-blue-300',
        canEmbed: false,
      };
    }
    // Generic Drive file
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : '';
    return {
      url,
      provider: 'GOOGLE_DRIVE',
      title: 'Tệp tin Google Drive',
      description: fileId ? `File ID: ${fileId}` : 'Google Drive Resource',
      badge: 'Google Drive',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
      badgeText: 'text-blue-700 dark:text-blue-300',
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : undefined,
      canEmbed: Boolean(fileId),
    };
  }

  // 2. Figma Design / Prototype
  if (url.includes('figma.com/')) {
    let title = 'Bản thiết kế Figma';
    let badge = 'Figma Design';
    if (url.includes('/proto/')) {
      title = 'Nguyên mẫu Figma Prototype';
      badge = 'Figma Prototype';
    } else if (url.includes('/board/')) {
      title = 'Bảng vẽ FigJam';
      badge = 'FigJam';
    }

    // Try extracting file name from URL slug: figma.com/file/:id/:name or figma.com/design/:id/:name
    let cleanName = '';
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 3) {
        cleanName = decodeURIComponent(segments[2].replace(/-/g, ' '));
      }
    } catch {
      // ignore
    }

    const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    return {
      url,
      provider: 'FIGMA',
      title: cleanName ? `Figma: ${cleanName}` : title,
      description: cleanName ? 'Xem trước bản thiết kế giao diện Figma trực tiếp' : 'Tài nguyên thiết kế giao diện Figma',
      badge,
      badgeBg: 'bg-purple-100 dark:bg-purple-900/30',
      badgeText: 'text-purple-700 dark:text-purple-300',
      embedUrl,
      canEmbed: true,
    };
  }

  // 3. GitHub
  if (url.includes('github.com/')) {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 2) {
        const owner = segments[0];
        const repo = segments[1];
        const repoPath = `${owner}/${repo}`;

        // Pull Request: github.com/:owner/:repo/pull/:prId
        if (segments[2] === 'pull' && segments[3]) {
          return {
            url,
            provider: 'GITHUB',
            title: `Pull Request #${segments[3]}`,
            description: `Kho mã nguồn: ${repoPath}`,
            badge: `PR #${segments[3]}`,
            badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            badgeText: 'text-emerald-700 dark:text-emerald-300',
            canEmbed: false,
          };
        }

        // Issues: github.com/:owner/:repo/issues/:issueId
        if (segments[2] === 'issues' && segments[3]) {
          return {
            url,
            provider: 'GITHUB',
            title: `Issue #${segments[3]}`,
            description: `Kho mã nguồn: ${repoPath}`,
            badge: `Issue #${segments[3]}`,
            badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
            badgeText: 'text-amber-700 dark:text-amber-300',
            canEmbed: false,
          };
        }

        // Commit: github.com/:owner/:repo/commit/:hash
        if (segments[2] === 'commit' && segments[3]) {
          const shortHash = segments[3].substring(0, 7);
          return {
            url,
            provider: 'GITHUB',
            title: `Commit: ${shortHash}`,
            description: `Kho mã nguồn: ${repoPath}`,
            badge: `Commit ${shortHash}`,
            badgeBg: 'bg-gray-100 dark:bg-gray-800',
            badgeText: 'text-gray-700 dark:text-gray-300',
            canEmbed: false,
          };
        }

        // Repo root
        return {
          url,
          provider: 'GITHUB',
          title: `GitHub: ${repoPath}`,
          description: `Kho lưu trữ mã nguồn ${repoPath} trên GitHub`,
          badge: 'GitHub Repo',
          badgeBg: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
          badgeText: '',
          canEmbed: false,
        };
      }
    } catch {
      // fallback
    }

    return {
      url,
      provider: 'GITHUB',
      title: 'Tài nguyên GitHub',
      description: url,
      badge: 'GitHub',
      badgeBg: 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900',
      badgeText: '',
      canEmbed: false,
    };
  }

  // 4. Other URL
  return {
    url,
    provider: 'OTHER',
    title: 'Liên kết ngoài',
    description: url,
    badge: 'Liên kết',
    badgeBg: 'bg-gray-100 dark:bg-gray-800',
    badgeText: 'text-gray-600 dark:text-gray-300',
    canEmbed: false,
  };
}

interface TaskLinkPreviewProps {
  url: string;
  onRemove?: () => void;
  defaultExpanded?: boolean;
}

export const TaskLinkPreview: React.FC<TaskLinkPreviewProps> = ({
  url,
  onRemove,
  defaultExpanded = false,
}) => {
  const info = parseResourceLink(url);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getProviderIcon = () => {
    switch (info.provider) {
      case 'GOOGLE_DRIVE':
        return (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/40 dark:text-blue-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
            </svg>
          </div>
        );
      case 'FIGMA':
        return (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shadow-sm dark:bg-purple-900/40 dark:text-purple-300">
            <svg className="h-5 w-5" viewBox="0 0 38 57" fill="currentColor">
              <path fill="#F24E1E" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
              <path fill="#A259FF" d="M0 47.5a9.5 9.5 0 0 1 9.5-9.5H19v9.5a9.5 9.5 0 1 1-19 0z" />
              <path fill="#1ABCFE" d="M0 28.5a9.5 9.5 0 0 1 9.5-9.5H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" />
              <path fill="#0ACF83" d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" />
              <path fill="#FF7262" d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" />
            </svg>
          </div>
        );
      case 'GITHUB':
        return (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm dark:bg-gray-800 dark:text-gray-100">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-3">
          {getProviderIcon()}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${info.badgeBg} ${info.badgeText}`}>
                {info.badge}
              </span>
              <a
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs font-semibold text-gray-900 hover:text-brand-600 hover:underline dark:text-white dark:hover:text-brand-400"
                title={info.title}
              >
                {info.title}
              </a>
            </div>
            <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
              {info.description}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {info.canEmbed && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span>{isExpanded ? 'Thu gọn' : '👁 Xem trước'}</span>
            </button>
          )}

          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60"
            title="Mở liên kết trong tab mới"
          >
            <span>Mở</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
              title="Xoá liên kết"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Khung nhúng xem trước (Iframe Embed) */}
      {info.canEmbed && isExpanded && info.embedUrl && (
        <div className="border-t border-gray-100 bg-gray-900/5 p-2 dark:border-gray-800 dark:bg-black/30">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-inner dark:border-gray-800 dark:bg-gray-950">
            <iframe
              src={info.embedUrl}
              title={`Preview: ${info.title}`}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
          <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-gray-400">
            <span>Khung xem trước từ {info.badge}</span>
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-500 hover:underline"
            >
              Mở toàn màn hình ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

