import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PersonaCard } from '@/src/components/PersonaCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PageTitle } from '@/src/components/PageTitle';
import { useApp } from '@/src/context/AppContext';
import { similarity } from '@/src/utils/persona';
import { theme } from '@/src/constants/theme';

export default function IdealResult() {
  const { self, ideal } = useApp();
  if (!ideal) return null;
  const value = self ? similarity(self.scores, ideal.scores) : 0;
  return (
    <Screen>
      <PageTitle eyebrow="IDEAL CREATED" title="두 번째 내가 입주할 준비를 마쳤어요." />
      <PersonaCard persona={ideal} />
      <View style={styles.matchBox}>
        <Text style={styles.matchLabel}>현재 SELF ↔ IDEAL</Text>
        <Text style={styles.matchValue}>{value}%</Text>
        <Text style={styles.matchText}>이 숫자는 좋고 나쁨이 아니라 지금의 나와 원하는 나 사이의 거리입니다.</Text>
      </View>
      <PrimaryButton label="우리 방으로 들어가기" onPress={() => router.push('/room')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  matchBox: { marginVertical: 18, backgroundColor: theme.colors.softGold, borderRadius: 22, padding: 20 },
  matchLabel: { color: theme.colors.muted, fontWeight: '800', fontSize: 12 },
  matchValue: { color: theme.colors.text, fontSize: 42, fontWeight: '900', marginVertical: 5 },
  matchText: { color: theme.colors.muted, lineHeight: 20, fontSize: 13 },
});
