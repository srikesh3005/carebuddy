import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface PillIconProps {
  size?: number;
  color?: string;
}

export const PillIcon: React.FC<PillIconProps> = ({ size = 100, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 400 400" fill="none">
      <Circle cx="200" cy="200" r="200" fill="#4A9B96" />
      <Path
        d="M280 120L200 200M200 200L120 280M200 200L280 280M200 200L120 120"
        stroke={color}
        strokeWidth="35"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M150 100C120 100 100 120 100 150L100 250C100 280 120 300 150 300L250 300C280 300 300 280 300 250L300 150C300 120 280 100 250 100L150 100Z"
        stroke={color}
        strokeWidth="35"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};
