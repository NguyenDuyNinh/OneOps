import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function StrokeIcon({
  children,
  strokeWidth = 2,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Plus = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M12 5v14M5 12h14" />
  </StrokeIcon>
);

export const X = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </StrokeIcon>
);

export const Check = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </StrokeIcon>
);

export const ChevronLeft = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m15 18-6-6 6-6" />
  </StrokeIcon>
);

export const ChevronRight = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m9 18 6-6-6-6" />
  </StrokeIcon>
);

export const ChevronDown = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m6 9 6 6 6-6" />
  </StrokeIcon>
);

export const ChevronUp = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m18 15-6-6-6 6" />
  </StrokeIcon>
);

export const ChevronsUpDown = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </StrokeIcon>
);

export const MoreHorizontal = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </StrokeIcon>
);

export const Calendar = (p: IconProps) => (
  <StrokeIcon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </StrokeIcon>
);

export const Clock = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </StrokeIcon>
);

export const AlertCircle = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </StrokeIcon>
);

export const CheckSquare = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </StrokeIcon>
);

export const CheckCircle2 = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </StrokeIcon>
);

export const GripVertical = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </StrokeIcon>
);

export const FolderKanban = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    <path d="M8 10v4M12 10v2M16 10v6" />
  </StrokeIcon>
);

export const Columns3 = (p: IconProps) => (
  <StrokeIcon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18" />
  </StrokeIcon>
);

export const LayoutDashboard = (p: IconProps) => (
  <StrokeIcon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </StrokeIcon>
);

export const RotateCw = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </StrokeIcon>
);

export const Maximize2 = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </StrokeIcon>
);

export const ListFilter = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M3 6h18M7 12h10M10 18h4" />
  </StrokeIcon>
);

export const Search = (p: IconProps) => (
  <StrokeIcon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </StrokeIcon>
);

export const Bell = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </StrokeIcon>
);

export const Home = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </StrokeIcon>
);

export const MessageSquare = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </StrokeIcon>
);

export const FileText = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </StrokeIcon>
);

export const Grid = (p: IconProps) => (
  <StrokeIcon {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </StrokeIcon>
);

export const Layers = (p: IconProps) => (
  <StrokeIcon {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </StrokeIcon>
);

export const Star = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </StrokeIcon>
);

export const Bookmark = (p: IconProps) => (
  <StrokeIcon {...p}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </StrokeIcon>
);
