import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { color } from '@/theme';

/**
 * Icons are the prototype's inline SVGs, path data copied verbatim so the
 * silhouettes match the approved design. All are 24x24 stroked outlines.
 */
const paths = {
  book: (
    <Path d="M4 5.5c2.5-1.3 5.5-1.3 8 0v13c-2.5-1.3-5.5-1.3-8 0z M20 5.5c-2.5-1.3-5.5-1.3-8 0v13c2.5-1.3 5.5-1.3 8 0z" />
  ),
  user: (
    <>
      <Circle cx={12} cy={8} r={3.6} />
      <Path d="M4.5 20c.8-4 4-6 7.5-6s6.7 2 7.5 6" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s7-7.2 7-12.2A7 7 0 0 0 5 8.8C5 13.8 12 21 12 21Z" />
      <Circle cx={12} cy={9} r={2.4} />
    </>
  ),
  chevron: <Path d="M9 5.5 15.5 12 9 18.5" />,
  chevronLeft: <Path d="M15 5.5 8.5 12 15 18.5" />,
  mail: (
    <>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2.4} />
      <Path d="m4.5 7 7.5 5.5L19.5 7" />
    </>
  ),
  phone: (
    <Path d="M6.5 3.5h4l1.5 4-2.2 1.6a12 12 0 0 0 5.6 5.6l1.6-2.2 4 1.5v4c0 1-1 1.6-2 1.5-8-1-13.5-6.5-14.5-14.5-.1-1 .5-2 1.5-2Z" />
  ),
  lock: (
    <>
      <Rect x={5.5} y={10.5} width={13} height={9.5} rx={2.2} />
      <Path d="M8.3 10.5V7.8a3.7 3.7 0 0 1 7.4 0v2.7" />
    </>
  ),
  check: <Path d="M5 12.5 9.5 17 19 7" />,
  cloudOff: (
    <>
      <Path d="M7 18h9.5a3.5 3.5 0 0 0 .8-6.9A5.5 5.5 0 0 0 7.5 8.5" />
      <Path d="M3.5 3.5l17 17" />
    </>
  ),
  calendar: (
    <>
      <Rect x={4} y={5.5} width={16} height={14.5} rx={3} />
      <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  clipboard: (
    <>
      <Rect x={5.5} y={4.5} width={13} height={15.5} rx={3} />
      <Path d="M9 4.5V3.4A1.4 1.4 0 0 1 10.4 2h3.2A1.4 1.4 0 0 1 15 3.4v1.1M9 11h6M9 15h4" />
    </>
  ),
  chart: <Path d="M4.5 19.5h15M7.5 16V10M12 16V5.5M16.5 16v-4" />,
  message: <Path d="M20 12.5a7 7 0 0 1-7 7H8l-4 2.5.9-3.6A7 7 0 0 1 11 5.5h2a7 7 0 0 1 7 7Z" />,
  logout: (
    <>
      <Path d="M14.5 7.5V5.8A1.8 1.8 0 0 0 12.7 4H6.3A1.8 1.8 0 0 0 4.5 5.8v12.4A1.8 1.8 0 0 0 6.3 20h6.4a1.8 1.8 0 0 0 1.8-1.8v-1.7" />
      <Path d="M10 12h10m0 0-3-3m3 3-3 3" />
    </>
  ),
  bell: (
    <>
      <Path d="M6.5 8.5a5.5 5.5 0 0 1 11 0c0 6.5 2.5 7.5 2.5 7.5h-16s2.5-1 2.5-7.5Z" />
      <Path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  users: (
    <>
      <Circle cx={9} cy={8} r={3} />
      <Path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
      <Circle cx={17} cy={9} r={2.4} />
      <Path d="M15.5 14.2c2.4.4 4 2 4.5 4.3" />
    </>
  ),
  calendarCheck: (
    <>
      <Rect x={3.5} y={5} width={17} height={15} rx={2.5} />
      <Path d="M3.5 9.5h17M8 3v4M16 3v4M8.5 14.5l2 2 4-4.5" />
    </>
  ),
  home: <Path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" />,
  shield: (
    <>
      <Path d="M12 3.5 19 6.5v5c0 5.2-3.6 8.7-7 9.9-3.4-1.2-7-4.7-7-9.9v-5Z" />
      <Path d="M9 12.2l2 2 4-4.2" />
    </>
  ),
  refresh: <Path d="M20 12a8 8 0 1 1-2.6-5.9M20 4.5V10h-5.5" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  stroke = color.inkSoft,
  width = 1.8,
}: {
  name: IconName;
  size?: number;
  stroke?: string;
  width?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round">
      {paths[name]}
    </Svg>
  );
}
