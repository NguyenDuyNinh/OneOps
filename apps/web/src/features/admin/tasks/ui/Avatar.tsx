import React from "react";
import type { AvatarType } from "../types";

interface AvatarProps {
  type: AvatarType;
  size?: number;
  className?: string;
}

export const BaseAvatar: React.FC<AvatarProps> = ({
  type,
  size = 28,
  className = "",
}) => {
  switch (type) {
    case "female_dark_hair":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          className={`shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="18" fill="#FDE2D2" />
          <path
            d="M8 16C8 9.5 12.2 6 18 6C23.8 6 28 9.5 28 16V29H8V16Z"
            fill="#231F20"
          />
          <path
            d="M7 36C7 30.5 11.5 27.5 18 27.5C24.5 27.5 29 30.5 29 36H7Z"
            fill="#D9383A"
          />
          <rect x="15.5" y="23" width="5" height="6" rx="2.5" fill="#F7C19B" />
          <ellipse cx="18" cy="17.5" rx="6.2" ry="7" fill="#FAD2B4" />
          <path
            d="M11.5 15.5C12.5 11.5 15.5 10 21 11.5C23 12 24.5 14 24.5 16C24.5 11 22 7.5 18 7.5C13.5 7.5 11.5 11 11.5 15.5Z"
            fill="#231F20"
          />
          <circle cx="15.7" cy="17.5" r="0.8" fill="#231F20" />
          <circle cx="20.3" cy="17.5" r="0.8" fill="#231F20" />
          <path
            d="M16.5 21C17.2 21.6 18.8 21.6 19.5 21"
            stroke="#C95B4C"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "male_glasses":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          className={`shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="18" fill="#FCE5D4" />
          <path
            d="M7 36C7 30.5 11.5 27.5 18 27.5C24.5 27.5 29 30.5 29 36H7Z"
            fill="#3B5998"
          />
          <path d="M14 27.5L18 33L22 27.5H14Z" fill="#FFFFFF" />
          <rect x="15.2" y="22.5" width="5.6" height="6.5" rx="2.5" fill="#F1B893" />
          <ellipse cx="18" cy="17" rx="6.4" ry="7.2" fill="#F7C8A6" />
          <path
            d="M11.5 15C11.5 10 14.2 7.2 18.2 7.2C22.2 7.2 24.6 9.8 24.6 15C23.5 12.5 21.2 11.2 17.8 11.5C14.5 11.8 12.6 13 11.5 15Z"
            fill="#6D3B24"
          />
          <rect
            x="13.2"
            y="15.5"
            width="4"
            height="2.8"
            rx="0.7"
            stroke="#374151"
            strokeWidth="0.9"
          />
          <rect
            x="18.8"
            y="15.5"
            width="4"
            height="2.8"
            rx="0.7"
            stroke="#374151"
            strokeWidth="0.9"
          />
          <line
            x1="17.2"
            y1="16.8"
            x2="18.8"
            y2="16.8"
            stroke="#374151"
            strokeWidth="0.9"
          />
          <path
            d="M16.5 21C17.3 21.5 18.7 21.5 19.5 21"
            stroke="#9A5B42"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "female_brown_hair":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          className={`shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="18" fill="#FBE3D3" />
          <path
            d="M8.5 16.5C8.5 10 12.5 6.5 18 6.5C23.5 6.5 27.5 10 27.5 16.5V28.5H8.5V16.5Z"
            fill="#6E3B26"
          />
          <path
            d="M7.5 36C7.5 30.5 12 27.5 18 27.5C24 27.5 28.5 30.5 28.5 36H7.5Z"
            fill="#E05A47"
          />
          <rect x="15.5" y="23" width="5" height="6" rx="2.5" fill="#F2BC98" />
          <ellipse cx="18" cy="17.5" rx="6" ry="6.8" fill="#F9CEB0" />
          <path
            d="M11.8 15.5C12.8 11.8 16 10.2 21.2 11.8C23.2 12.5 24.2 14.2 24.2 15.8C24.2 10.8 21.8 7.8 18 7.8C13.8 7.8 11.8 11.2 11.8 15.5Z"
            fill="#6E3B26"
          />
          <circle cx="15.8" cy="17.5" r="0.8" fill="#3B2318" />
          <circle cx="20.2" cy="17.5" r="0.8" fill="#3B2318" />
          <path
            d="M16.5 20.8C17.2 21.4 18.8 21.4 19.5 20.8"
            stroke="#C45A4A"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "male_blonde":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          className={`shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="18" fill="#FDE8D7" />
          <path
            d="M7 36C7 30.5 11.5 27.5 18 27.5C24.5 27.5 29 30.5 29 36H7Z"
            fill="#F3B684"
          />
          <path d="M14.5 27.5L18 33.5L21.5 27.5H14.5Z" fill="#FFFFFF" />
          <rect x="15.2" y="22.5" width="5.6" height="6.2" rx="2.5" fill="#F5C39E" />
          <ellipse cx="18" cy="17.2" rx="6.2" ry="7" fill="#FAD2B4" />
          <path
            d="M11.5 15.2C11.5 9.8 14.4 7.2 18 7.2C21.8 7.2 24.5 9.8 24.5 15.2C23.2 12.4 20.8 11 18 11.2C14.8 11.4 12.8 12.8 11.5 15.2Z"
            fill="#E59856"
          />
          <circle cx="15.7" cy="17.2" r="0.8" fill="#5C3A21" />
          <circle cx="20.3" cy="17.2" r="0.8" fill="#5C3A21" />
          <path
            d="M16.6 20.8C17.4 21.3 18.6 21.3 19.4 20.8"
            stroke="#C87A55"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "male_dark_hair":
    case "male_suit":
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          className={`shrink-0 rounded-full ${className}`}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="18" fill="#FBE1CF" />
          <path
            d="M6.5 36C6.5 30.2 11.2 27.2 18 27.2C24.8 27.2 29.5 30.2 29.5 36H6.5Z"
            fill="#2A2729"
          />
          <path d="M14.2 27.2L18 34.5L21.8 27.2H14.2Z" fill="#FFFFFF" />
          <path
            d="M17.2 28.2H18.8L19.3 34.5L18 36L16.7 34.5L17.2 28.2Z"
            fill="#D63638"
          />
          <rect x="15.2" y="22.5" width="5.6" height="6" rx="2.5" fill="#F1BA95" />
          <ellipse cx="18" cy="17" rx="6.3" ry="7" fill="#F8CAA8" />
          <path
            d="M11.4 15.2C11.4 9.5 14.2 6.8 18.2 6.8C22.2 6.8 24.6 9.5 24.6 15.2C23.5 12.2 21 10.8 17.8 11C14.5 11.2 12.6 12.6 11.4 15.2Z"
            fill="#231F20"
          />
          <circle cx="15.7" cy="17.2" r="0.8" fill="#231F20" />
          <circle cx="20.3" cy="17.2" r="0.8" fill="#231F20" />
          <path
            d="M16.5 20.8C17.3 21.3 18.7 21.3 19.5 20.8"
            stroke="#A85C48"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};

export default BaseAvatar;
