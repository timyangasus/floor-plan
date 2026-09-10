interface IconProps {
  size?: number
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function SelectIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  )
}

export function PanIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  )
}

export function GridIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

export function RouterIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="4" y="10" width="16" height="7" rx="1.5" />
      <circle cx="8" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M8 10V7" />
      <path d="M6 7a3 3 0 016 0" />
    </svg>
  )
}

export function WifiIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={2.4} />
    </svg>
  )
}

export function NetworkIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export function MenuIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function EditIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function LayersIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export function UndoIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="9 14 4 9 9 4" />
      <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
    </svg>
  )
}

export function RedoIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="15 14 20 9 15 4" />
      <path d="M20 9H9.5a5.5 5.5 0 000 11H13" />
    </svg>
  )
}

export function CenterIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
    </svg>
  )
}

export function ZoomInIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

export function ZoomOutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

export function RotateIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  )
}

export function TrashIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

export function HomeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

export function RulerIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="2.5" y="7" width="19" height="10" rx="1.5" transform="rotate(-45 12 12)" />
      <path d="M8.5 9.5l1.4 1.4" />
      <path d="M11 7l1.4 1.4" />
      <path d="M13.5 4.5l1.4 1.4" />
    </svg>
  )
}

export function PhoneIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

export function CheckIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function HelpIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 014.7 1.2c0 1.7-2.5 2-2.5 3.3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.4} />
    </svg>
  )
}

export function CloseIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
