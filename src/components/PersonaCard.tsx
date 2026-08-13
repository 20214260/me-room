import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Persona } from '@/src/types/persona';
import { PersonaAvatar } from './PersonaAvatar';
import { theme } from '@/src/constants/theme';

const label = { SELF: '내가 보는 나', MIRROR: '남들이 보는 나', IDEAL: '되고 싶은 나' };

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <View style={styles.card}>
      <PersonaAvatar type={persona.type} size={88} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{persona.type} · {label[persona.type]}</Text>
        <Text style={styles.title}>{persona.title}</Text>
        <Text style={styles.summary}>{persona.summary}</Text>
        <View style={styles.keywordRow}>
          {persona.keywords.map((keyword) => (
            <View key={keyword} style={styles.keyword}><Text style={styles.keywordText}>#{keyword}</Text></View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 18, flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.line },
  copy: { flex: 1, marginLeft: 14 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: theme.colors.muted, marginBottom: 7 },
  title: { fontSize: 20, lineHeight: 27, fontWeight: '800', color: theme.colors.text, marginBottom: 7 },
  summary: { color: theme.colors.muted, lineHeight: 20, fontSize: 13 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 11 },
  keyword: { backgroundColor: theme.colors.background, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, marginRight: 5, marginBottom: 5 },
  keywordText: { fontSize: 11, color: theme.colors.text, fontWeight: '600' },
});
