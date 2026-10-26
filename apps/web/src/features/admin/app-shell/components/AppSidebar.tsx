"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { SIDEBAR_CLASSES, SIDEBAR_PANEL } from "../constants";
import type { NavSection } from "../nav";

type TooltipState = { name: string; x: number; y: number } | null;

/**
 * Rail sidebar gọn kiểu icon-only (như deplao-crm: w-16, nút 40px):
 * - Rail (w-16): mỗi nhóm là 1 nút icon vuông w-10 h-10; BẤM → VÀO THẲNG trang chính.
 * - Hover nút → tooltip chú thích NỔI LÊN ngoài mép rail (không bị che).
 * - Rail KHÔNG hiện thanh trượt (ẩn scrollbar, vẫn cuộn được).
 * - Nút mở rộng ở CUỐI rail (ghim đáy, không cuộn theo icon) → panel trang con
 *   hiện cạnh rail, PUSH nội dung (không đè).
 * - Mobile: drawer + hamburger header.
 */
type AppSidebarProps = {
  /** Navigation của bề mặt hiện tại — lấy từ `features/<surface>/nav.generated.ts`. */
  sections: NavSection[];
};

const AppSidebar: React.FC<AppSidebarProps> = ({ sections }) => {
  const {
    isMobileOpen,
    isSubmenuOpen,
    selectedSection,
    toggleSubmenuPanel,
    openSubmenuPanel,
    closeSubmenuPanel,
    setSelectedSection,
    toggleMobileSidebar,
  } = useSidebar();
  const pathname = usePathname();

  const isSectionActive = (section: NavSection) =>
    section.path === pathname || (section.items?.some((item) => item.path === pathname) ?? false);

  // Section hiện thị trong panel: user bấm gần nhất, ngược lại theo route hiện tại.
  const routeIdx = sections.findIndex((s) => isSectionActive(s));
  const panelIndex = selectedSection ?? (routeIdx >= 0 ? routeIdx : 0);
  const panelSection = sections[panelIndex];
  // Nhóm không có trang con → KHÔNG hiện panel railsidebar (đóng nếu đang mở).
  const showPanel = isSubmenuOpen && !!panelSection?.items?.length;

  const closeMobileDrawer = () => {
    if (window.innerWidth < 768 && isMobileOpen) toggleMobileSidebar();
  };

  // Tooltip FIXED duy nhất (không nằm trong nav có overflow → không bị che).
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  // Panel submenu KÉO được mép phải để đổi rộng (thay vì fix cứng).
  // Ẩn scroll ngang (overflow-x-clip), chỉ cuộn dọc.
  const [panelWidth, setPanelWidth] = useState<number>(SIDEBAR_PANEL.defaultWidth);
  const [resizing, setResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(SIDEBAR_PANEL.storageKey));
      if (stored >= SIDEBAR_PANEL.minWidth && stored <= SIDEBAR_PANEL.maxWidth) {
        setPanelWidth(stored);
      }
    } catch {
      /* localStorage không dùng được — bỏ qua */
    }
  }, []);

  // Khi đang kéo: theo pointer toàn window, nhả chuột thì dừng + lưu.
  useEffect(() => {
    if (!resizing) return;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const handleMove = (e: PointerEvent) => {
      const start = resizeRef.current;
      if (!start) return;
      const next = Math.round(start.startW + (e.clientX - start.startX));
      const clamped = Math.min(SIDEBAR_PANEL.maxWidth, Math.max(SIDEBAR_PANEL.minWidth, next));
      start.startW = clamped;
      start.startX = e.clientX;
      setPanelWidth(clamped);
    };
    const handleUp = () => {
      const finalW = resizeRef.current?.startW ?? panelWidth;
      setResizing(false);
      resizeRef.current = null;
      try {
        localStorage.setItem(SIDEBAR_PANEL.storageKey, String(finalW));
      } catch {
        /* bỏ qua */
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startW: panelWidth };
    setResizing(true);
  };

  const resetPanelWidth = () => setPanelWidth(SIDEBAR_PANEL.defaultWidth);

  const showTooltip = (e: React.MouseEvent | React.FocusEvent, name: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ name, x: rect.right + 10, y: rect.top + rect.height / 2 });
  };

  const tileClass = (active: boolean) =>
    `flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors ${
      active
        ? "bg-brand-500 text-white shadow-sm"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  const railInner = (
    <>
      {/* no-scrollbar: ẩn thanh trượt khi nhiều icon, vẫn cuộn bằng wheel/trackpad */}
      <nav className="no-scrollbar flex-1 overflow-x-clip overflow-y-auto px-2 pt-3 pb-3">
        <ul className="flex flex-col items-center gap-1">
          {sections.map((section, index) => {
            const active = isSectionActive(section);
            return (
              <li key={section.name} className="group relative">
                <Link
                  href={section.path}
                  aria-label={section.name}
                  title={section.name}
                  onClick={() => {
                    // Bấm icon: vào thẳng trang chính.
                    // Nhóm CÓ trang con → panel railsidebar TỰ MỞ và đổi sang nhóm đó.
                    // Nhóm không có trang con → đóng panel railsidebar.
                    setSelectedSection(index);
                    if (section.items?.length) openSubmenuPanel();
                    else closeSubmenuPanel();
                    closeMobileDrawer();
                  }}
                  onMouseEnter={(e) => showTooltip(e, section.name)}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={(e) => showTooltip(e, section.name)}
                  onBlur={() => setTooltip(null)}
                  className={tileClass(active)}
                >
                  {section.icon}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Nút mở rộng — LUÔN ở CUỐI rail (ghim đáy, không cuộn theo icon).
          Icon hamburger giữ nguyên; khi mở: nền brand + bóng đổ. */}
      <div className="hidden shrink-0 justify-center border-t border-gray-100 px-2 py-3 md:flex dark:border-gray-800">
        <button
          type="button"
          onClick={() => panelSection?.items?.length && toggleSubmenuPanel()}
          aria-expanded={showPanel}
          aria-label={showPanel ? "Đóng panel" : "Mở panel"}
          title={showPanel ? "Đóng panel" : "Mở panel"}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ${
            showPanel
              ? "text-brand-500 dark:text-brand-400 bg-gray-100 shadow-inner dark:bg-white/10"
              : "hover:text-brand-500 dark:hover:text-brand-400 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          }`}
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Tooltip FIXED — nền trắng chữ đen (light), invert trong dark; nổi trên mọi layer */}
      {tooltip && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[100] hidden -translate-y-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-gray-900 shadow-lg md:block dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.name}
          <span className="absolute top-1/2 -left-[5px] -mt-[5px] h-2.5 w-2.5 rotate-45 rounded-[2px] border-b border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        </span>
      )}

      {/* ===== Desktop: rail + panel trang con trong flow (PUSH nội dung) ===== */}
      <div className="hidden shrink-0 self-stretch md:flex">
        <aside
          className={`flex h-full flex-col border-r border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 ${SIDEBAR_CLASSES.railWidth}`}
        >
          {railInner}
        </aside>

        {/* Panel: CHỈ hiện các trang con của section đang chọn trên rail
            (vd bấm Báo cáo → chỉ nhóm báo cáo, không lai các nhóm khác).
            Ẩn scroll ngang + KÉO mép phải để đổi rộng (lưu localStorage). */}
        <div
          className={`relative h-full bg-white dark:bg-gray-900 ${
            resizing ? "select-none" : "transition-[width] duration-300 ease-in-out"
          } ${
            showPanel
              ? "overflow-x-clip overflow-y-auto border-r border-gray-200 dark:border-gray-800"
              : "overflow-hidden"
          }`}
          style={{ width: showPanel ? panelWidth : 0 }}
        >
          <div className="px-3 py-4" style={{ width: panelWidth }}>
            <h2 className="mb-2 truncate px-2 text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
              {panelSection?.name}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {panelSection?.items?.map((item) => {
                const active = item.path === pathname;
                return (
                  <li key={`${panelSection.name}-${item.name}`}>
                    <Link
                      href={item.path}
                      className={`menu-dropdown-item ${
                        active ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {item.icon && (
                        <span
                          className={
                            active
                              ? "text-brand-500 dark:text-brand-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {item.icon}
                        </span>
                      )}
                      {item.name}
                      {item.new && (
                        <span className="menu-dropdown-badge menu-dropdown-badge-active ml-auto">
                          new
                        </span>
                      )}
                      {item.pro && (
                        <span className="menu-dropdown-badge menu-dropdown-badge-inactive ml-auto">
                          pro
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tay kéo mép phải panel — double-click để về rộng mặc định */}
          {showPanel && (
            <span
              role="separator"
              aria-orientation="vertical"
              aria-label="Kéo để đổi rộng panel"
              title="Kéo để đổi rộng • Double-click để reset"
              onPointerDown={startResize}
              onDoubleClick={resetPanelWidth}
              className={`hover:bg-brand-500/60 absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none bg-transparent transition-colors ${
                resizing ? "bg-brand-500/60" : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* ===== Mobile: rail là drawer ===== */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white text-gray-900 transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${SIDEBAR_CLASSES.railWidth} md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {railInner}
      </aside>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
    </>
  );
};

export default AppSidebar;
