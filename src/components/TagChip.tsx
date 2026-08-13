import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/src/constants/theme';

export function TagChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{selected ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    marginBottom: 10,
  },
  selected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  text: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  selectedText: { color: '#FFFFFF' },
});
