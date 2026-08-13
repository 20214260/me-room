import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/src/constants/theme';

export function PageTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  eyebrow: { color: theme.colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 },
  title: { color: theme.colors.text, fontSize: 30, lineHeight: 38, fontWeight: '900', letterSpacing: -0.7 },
  description: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
});
