"use client";

import React from "react";
import type { RequestItem } from "../types";
import { Check, X } from "../ui/icons";

interface RequestApprovalModalProps {
  request: RequestItem | null;
  onClose: () => void;
  onToggleRequest: (reqId: string) => void;
}

export const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({
  request,
  onClose,
  onToggleRequest,
}) => {
  if (!request) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[4px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[42px] bg-[#14499D] text-white px-4 flex items-center justify-between">
          <span id="request-modal-title" className="text-[14px] font-semibold">
            Chi tiết đề xuất phê duyệt
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết đề xuất"
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="text-sm font-bold text-gray-900">
            {request.prefixTag} <span className="text-red-600">!</span> {request.title}
          </div>
          <div className="text-xs text-gray-500">{request.subtitle}</div>
          <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
            {request.content}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Bộ phận: <strong>{request.department}</strong> · {request.createdAt}
            </span>
            <button
              type="button"
              onClick={() => {
                onToggleRequest(request.id);
                onClose();
              }}
              className={`px-4 py-1.5 rounded text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer ${
                request.completed ? "bg-gray-600" : "bg-[#22C55E]"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{request.completed ? "Hoàn tác duyệt" : "Phê duyệt ngay"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
