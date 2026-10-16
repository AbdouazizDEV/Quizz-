import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import type { WestAfricanBadgeCode } from '@constants/westAfricanBadges';

type Props = { code: WestAfricanBadgeCode; size: number; color: string };

export function BadgeGlyph({ code, size, color }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 64 64' };

  switch (code) {
    case 'teranga':
      return (
        <Svg {...common}>
          <Path d="M12 38c0-11 9-20 20-20s20 9 20 20" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <Ellipse cx="32" cy="40" rx="18" ry="7" fill={color} opacity="0.35" />
          <Circle cx="32" cy="22" r="5" fill={color} />
        </Svg>
      );
    case 'griot':
      return (
        <Svg {...common}>
          <Rect x="22" y="14" width="20" height="36" rx="10" fill={color} />
          <Rect x="16" y="24" width="8" height="16" rx="3" fill={color} opacity="0.55" />
          <Rect x="40" y="24" width="8" height="16" rx="3" fill={color} opacity="0.55" />
        </Svg>
      );
    case 'kora':
      return (
        <Svg {...common}>
          <Circle cx="24" cy="40" r="12" fill={color} opacity="0.35" />
          <Path d="M24 28 L48 12" stroke={color} strokeWidth="3" />
          <Path d="M26 40 L46 16" stroke={color} strokeWidth="1.6" />
          <Path d="M28 40 L45 16" stroke={color} strokeWidth="1.6" />
          <Path d="M30 40 L44 16" stroke={color} strokeWidth="1.6" />
        </Svg>
      );
    case 'baobab':
      return (
        <Svg {...common}>
          <Path d="M30 52 V30" stroke={color} strokeWidth="6" strokeLinecap="round" />
          <Path d="M30 32 C18 30 16 20 22 16 C26 12 32 14 32 20 C34 12 44 12 46 20 C52 22 50 32 38 32 Z" fill={color} />
        </Svg>
      );
    case 'fleuve':
      return (
        <Svg {...common}>
          <Path d="M10 24 C20 18 28 30 38 24 C48 18 54 26 56 22" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
          <Path d="M10 34 C20 28 28 40 38 34 C48 28 54 36 56 32" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
          <Path d="M10 44 C20 38 28 50 38 44 C48 38 54 46 56 42" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
        </Svg>
      );
    case 'djembe':
      return (
        <Svg {...common}>
          <Ellipse cx="32" cy="18" rx="14" ry="6" fill={color} />
          <Path d="M20 18 L24 34 L40 34 L44 18 Z" fill={color} opacity="0.55" />
          <Path d="M24 34 L28 50 H36 L40 34 Z" fill={color} />
        </Svg>
      );
    case 'masque':
      return (
        <Svg {...common}>
          <Path d="M20 16 H44 C48 16 50 22 48 30 C46 44 40 50 32 50 S18 44 16 30 C14 22 16 16 20 16 Z" fill={color} />
          <Circle cx="26" cy="30" r="3" fill="#FFD166" />
          <Circle cx="38" cy="30" r="3" fill="#FFD166" />
        </Svg>
      );
    case 'soleil':
      return (
        <Svg {...common}>
          <Circle cx="32" cy="32" r="10" fill={color} />
          <Line x1="32" y1="8" x2="32" y2="16" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="32" y1="48" x2="32" y2="56" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="8" y1="32" x2="16" y2="32" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="48" y1="32" x2="56" y2="32" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="15" y1="15" x2="21" y2="21" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="43" y1="43" x2="49" y2="49" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="49" y1="15" x2="43" y2="21" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Line x1="21" y1="43" x2="15" y2="49" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case 'lion':
      return (
        <Svg {...common}>
          <Circle cx="32" cy="32" r="18" fill={color} opacity="0.35" />
          <Circle cx="32" cy="33" r="10" fill={color} />
          <Circle cx="28" cy="31" r="1.6" fill="#FFD166" />
          <Circle cx="36" cy="31" r="1.6" fill="#FFD166" />
        </Svg>
      );
    case 'or-sahel':
      return (
        <Svg {...common}>
          <Circle cx="32" cy="32" r="16" fill="none" stroke={color} strokeWidth="4" />
          <Path d="M20 36 L32 18 L44 36 Z" fill={color} />
          <Rect x="24" y="38" width="16" height="6" rx="2" fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}
