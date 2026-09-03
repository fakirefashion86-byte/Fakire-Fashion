type IconProps = { className?: string };

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
    >
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.8.7 6.5 3.3C14.7 4.7 16.5 3.7 18.5 4c3.5.5 5 4 3.5 7.2-2.5 4.7-10 9.3-10 9.3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 8h12l1 12H5L6 8z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function KurtaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M9 3l3 1.5L15 3l1 3-1.5 1v13h-9V7L4 6l1-3z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JacketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M9 3l3 2 3-2 4 3-2 3-2-1v12H8V8l-2 1-2-3 4-3z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KidIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M8 21v-6l-2-4 2-2h8l2 2-2 4v6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AccessoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6 9V7a6 6 0 0112 0v2" strokeLinecap="round" />
      <rect x="4" y="9" width="16" height="11" rx="2" />
    </svg>
  );
}

export function AwardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ScissorsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8 8l12 12M20 4L8 16" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 7h11v10H2z" strokeLinejoin="round" />
      <path d="M13 10h4l4 3v4h-8z" strokeLinejoin="round" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 12h16M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.4 5.3A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a13.2 13.2 0 01-3.1 3.9M6.2 6.2C3.6 7.9 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <path d="M12 3l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.3-.6L12 3z" strokeLinejoin="round" />
    </svg>
  );
}

export function RulerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 16l5-5 13 13-5 5L3 16z" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M8.5 11.5l2 2M11 9l2 2M13.5 6.5l2 2" strokeLinecap="round" />
    </svg>
  );
}

export function GemIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 9l4-6h8l4 6-10 12L4 9z" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M4 9h16M9.5 3l-2 6 4.5 12 4.5-12-2-6" strokeLinejoin="round" />
    </svg>
  );
}

export function SewingMachineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 19h13v-3H8l-2-3h11c2.5 0 4 1.5 4 3.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M17 9.5V13" strokeLinecap="round" />
      <path d="M6 19v2M12 19v2" strokeLinecap="round" />
    </svg>
  );
}

export function WrenchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M14.7 6.3a4 4 0 00-5.4 5l-6.3 6.3 2 2 6.3-6.3a4 4 0 005-5.4l-2.6 2.6-2-2 2.6-2.6z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 20l1.1-5.5A8.5 8.5 0 1121 11.5z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#25D366">
      <path d="M12.01 2C6.48 2 2 6.48 2 12.01c0 1.99.58 3.85 1.58 5.42L2 22l4.7-1.53a9.96 9.96 0 005.31 1.53h.01c5.52 0 10-4.48 10-10.01C22.02 6.48 17.53 2 12.01 2zm5.87 14.24c-.25.7-1.24 1.28-2.03 1.45-.55.12-1.26.21-3.67-.79-2.9-1.2-4.75-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.25-.29.55-.36.74-.36.19 0 .37 0 .53.01.17.01.4-.06.62.48.25.6.84 2.08.91 2.23.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.92 1.05.94 1.94 1.24 2.22 1.38.28.14.44.12.6-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.63-.14.26.09 1.64.78 1.92.92.28.14.47.21.54.33.07.12.07.71-.18 1.41z" />
    </svg>
  );
}

export function DeliveryVanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M2 6.5a1 1 0 011-1h9.5a1 1 0 011 1V16H3a1 1 0 01-1-1V6.5z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M2 6.5a1 1 0 011-1h9.5a1 1 0 011 1V16H3a1 1 0 01-1-1V6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 9.5H17l3.5 3V16h-7V9.5z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M13.5 9.5H17l3.5 3V16h-7V9.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18.5" r="1.75" fill="currentColor" />
      <circle cx="7" cy="18.5" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17.5" cy="18.5" r="1.75" fill="currentColor" />
      <circle cx="17.5" cy="18.5" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 18.5h6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 11.5v2.5h3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookingCalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" fill="currentColor" opacity="0.12" />
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3v4M16.5 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="13.2" r="1" fill="currentColor" />
      <circle cx="12" cy="13.2" r="1" fill="currentColor" />
      <circle cx="16" cy="13.2" r="1" fill="currentColor" />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
      <path
        d="M13 17.4l1.7 1.7 3-3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ZoomIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L21 21" strokeLinecap="round" />
      <path d="M10.5 8v5M8 10.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path
        d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3"
        strokeLinecap="round"
      />
      <path d="M18 3v4h-4M6 21v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MedalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 9l1.7 1.7L14.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
