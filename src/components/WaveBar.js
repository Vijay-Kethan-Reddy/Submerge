import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function WaveBar({ barCount = 20, maxHeight = 40, color = '#00A6CB' }) {
  // Generate some random heights for bars
  const bars = Array.from({ length: barCount }).map(() => {
    return Math.random() * maxHeight * 0.6 + maxHeight * 0.4; // bars between 40% and 100% height
  });

  return (
    <View style={[styles.container, { height: maxHeight }]}>
      {bars.map((height, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height, backgroundColor: color, marginRight: i === barCount - 1 ? 0 : 4 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
});
