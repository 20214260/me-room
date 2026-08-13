import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/src/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'dark',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'dark' | 'light';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'light' ? styles.light : styles.dark,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, variant === 'light' && styles.lightText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dark: { backgroundColor: theme.colors.accent },
  light: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  lightText: { color: theme.colors.text },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
