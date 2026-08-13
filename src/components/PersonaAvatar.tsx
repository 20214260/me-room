import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/src/constants/theme';
import { PersonaType } from '@/src/types/persona';

const config = {
  SELF: { color: theme.colors.self, soft: theme.colors.softPurple, icon: '◐' },
  MIRROR: { color: theme.colors.mirror, soft: theme.colors.softPink, icon: '◇' },
  IDEAL: { color: theme.colors.ideal, soft: theme.colors.softGold, icon: '✦' },
};

export function PersonaAvatar({ type, locked = false, size = 96 }: { type: PersonaType; locked?: boolean; size?: number }) {
  const c = config[type];
  return (
    <View style={[styles.wrap, { width: size, height: size + 30 }, locked && styles.locked]}>
      <View style={[styles.aura, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.soft }]}>
        <View style={[styles.head, { backgroundColor: c.color, width: size * 0.38, height: size * 0.38, borderRadius: size }]}>
          <Text style={[styles.face, { fontSize: size * 0.17 }]}>{locked ? '？' : c.icon}</Text>
        </View>
        <View style={[styles.body, { backgroundColor: c.color, width: size * 0.58, height: size * 0.42, borderRadius: size * 0.2 }]} />
      </View>
      {locked && <Text style={styles.lock}>LOCKED</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  aura: { alignItems: 'center', justifyContent: 'center' },
  head: { alignItems: 'center', justifyContent: 'center', zIndex: 2, marginBottom: -3 },
  face: { color: '#FFFFFF', fontWeight: '900' },
  body: { opacity: 0.92 },
  locked: { opacity: 0.45 },
  lock: { marginTop: 4, fontSize: 10, letterSpacing: 1.4, color: theme.colors.muted, fontWeight: '800' },
});
