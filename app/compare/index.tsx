import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScoreBar } from '@/src/components/ScoreBar';
import { useApp } from '@/src/context/AppContext';
import { biggestGap, similarity } from '@/src/utils/persona';
import { scoreLabels } from '@/src/types/persona';
import { theme } from '@/src/constants/theme';

export default function CompareScreen() {
  const { self, mirror, ideal } = useApp();

  const data = useMemo(() => {
    if (!self || !ideal) return null;
    return {
      selfIdeal: similarity(self.scores, ideal.scores),
      selfMirror: mirror ? similarity(self.scores, mirror.scores) : null,
      mirrorIdeal: mirror ? similarity(mirror.scores, ideal.scores) : null,
      blindSpot: mirror ? biggestGap(self.scores, mirror.scores) : null,
    };
  }, [self, mirror, ideal]);

  if (!self || !ideal || !data) return null;

  return (
    <Screen>
      <PageTitle eyebrow="COMPARE" title="세 가지 나는 얼마나 닮았을까요?" description="같고 다른 지점을 한눈에 비교합니다." />

      <View style={styles.matches}>
        <MatchCard label="SELF ↔ MIRROR" value={data.selfMirror} color={theme.colors.mirror} locked={!mirror} />
        <MatchCard label="SELF ↔ IDEAL" value={data.selfIdeal} color={theme.colors.ideal} />
        <MatchCard label="MIRROR ↔ IDEAL" value={data.mirrorIdeal} color={theme.colors.self} locked={!mirror} />
      </View>

      {mirror && data.blindSpot ? (
        <View style={styles.insight}>
          <Text style={styles.insightKicker}>BLIND SPOT</Text>
          <Text style={styles.insightTitle}>가장 크게 다르게 보고 있는 부분은 ‘{scoreLabels[data.blindSpot]}’입니다.</Text>
          <Text style={styles.insightText}>
            나는 {self.scores[data.blindSpot]}점으로 보고 있지만, 친구들은 {mirror.scores[data.blindSpot]}점으로 보고 있어요.
          </Text>
        </View>
      ) : null}

      <View style={styles.legendRow}>
        <Legend color={theme.colors.self} label="SELF" />
        <Legend color={theme.colors.mirror} label="MIRROR" />
        <Legend color={theme.colors.ideal} label="IDEAL" />
      </View>

      <View style={styles.panel}>
        {(Object.keys(self.scores) as (keyof typeof self.scores)[]).map((key) => (
          <View key={key} style={styles.traitBlock}>
            <Text style={styles.traitTitle}>{scoreLabels[key]}</Text>
            <ScoreBar label="SELF" value={self.scores[key]} color={theme.colors.self} />
            {mirror ? <ScoreBar label="MIRROR" value={mirror.scores[key]} color={theme.colors.mirror} /> : null}
            <ScoreBar label="IDEAL" value={ideal.scores[key]} color={theme.colors.ideal} />
          </View>
        ))}
      </View>

      <PrimaryButton label="ROOM으로 돌아가기" onPress={() => router.replace('/room')} />
    </Screen>
  );
}

function MatchCard({ label, value, color, locked = false }: { label: string; value: number | null; color: string; locked?: boolean }) {
  return (
    <View style={[styles.matchCard, { borderTopColor: color }]}>
      <Text style={styles.matchLabel}>{label}</Text>
      <Text style={styles.matchValue}>{locked || value === null ? '—' : `${value}%`}</Text>
      <Text style={styles.matchHint}>{locked ? 'MIRROR 잠금' : value! >= 75 ? '서로 꽤 가까움' : value! >= 55 ? '닮은 점과 다른 점이 공존' : '차이가 큰 편'}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  matches: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  matchCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: theme.colors.line, borderTopWidth: 4 },
  matchLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: '900' },
  matchValue: { color: theme.colors.text, fontSize: 25, fontWeight: '900', marginTop: 5 },
  matchHint: { color: theme.colors.muted, fontSize: 9, lineHeight: 13, marginTop: 4 },
  insight: { backgroundColor: '#E9F2ED', borderRadius: 22, padding: 18, marginBottom: 14 },
  insightKicker: { color: theme.colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  insightTitle: { color: theme.colors.text, fontSize: 17, lineHeight: 24, fontWeight: '900', marginTop: 7 },
  insightText: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, marginTop: 7 },
  legendRow: { flexDirection: 'row', marginVertical: 6, gap: 12 },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' },
  panel: { backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.line, padding: 17, marginBottom: 16 },
  traitBlock: { borderBottomWidth: 1, borderBottomColor: theme.colors.line, paddingBottom: 10, marginBottom: 16 },
  traitTitle: { color: theme.colors.text, fontWeight: '900', fontSize: 15, marginBottom: 11 },
});
