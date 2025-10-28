import React from 'react';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

export const GradientBlob: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="300" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgLinearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#D4E9F0" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#B8D9E8" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#C5BBDB" stopOpacity="0.4" />
          </SvgLinearGradient>
        </Defs>
        <Path
          fill="url(#blobGradient)"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: 300,
    overflow: 'hidden',
  },
});
