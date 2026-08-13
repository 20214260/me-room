import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/src/constants/theme';

export function ScoreBar({ label, value, color = theme.colors.self }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, value)}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  label: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  value: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  track: { height: 8, backgroundColor: '#ECE8E2', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
