import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PersonaCard } from '@/src/components/PersonaCard';
import { PageTitle } from '@/src/components/PageTitle';
import { ScoreBar } from '@/src/components/ScoreBar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { scoreLabels } from '@/src/types/persona';
import { similarity } from '@/src/utils/persona';
import { theme } from '@/src/constants/theme';

export default function MirrorResult() {
  const { self, mirror, responses } = useApp();
  if (!mirror) {
    return (
      <Screen scroll={false}>
        <View style={styles.locked}><Text style={styles.lockIcon}>◇</Text><Text style={styles.lockTitle}>아직 MIRROR가 잠겨 있어요.</Text><Text style={styles.lockText}>친구 응답이 3개 이상 필요합니다. 현재 {responses.length}/3</Text><View style={{ width: '100%', marginTop: 20 }}><PrimaryButton label="초대 화면으로" onPress={() => router.replace('/mirror/invite')} /></View></View>
      </Screen>
    );
  }
  const sim = self ? similarity(self.scores, mirror.scores) : 0;
  return (
    <Screen>
      <PageTitle eyebrow="MIRROR UNLOCKED" title="남들이 보는 내가 도착했어요." description={`${responses.length}명의 응답을 바탕으로 구성한 MIRROR입니다.`} />
      <PersonaCard persona={mirror} />
      <View style={styles.matchBox}>
        <Text style={styles.matchLabel}>SELF ↔ MIRROR 자기인식 일치도</Text>
        <Text style={styles.matchValue}>{sim}%</Text>
        <Text style={styles.matchText}>{sim >= 75 ? '내가 생각하는 나와 주변이 보는 나가 꽤 비슷합니다.' : '내가 생각하는 모습과 타인의 시선 사이에 발견할 만한 차이가 있습니다.'}</Text>
      </View>
      <View style={styles.panel}>
        {(Object.keys(mirror.scores) as (keyof typeof mirror.scores)[]).map((key) => <ScoreBar key={key} label={scoreLabels[key]} value={mirror.scores[key]} color={theme.colors.mirror} />)}
      </View>
      <PrimaryButton label="세 가지 나 비교하기" onPress={() => router.push('/compare')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  matchBox: { marginTop: 16, backgroundColor: theme.colors.softPink, borderRadius: 22, padding: 20 },
  matchLabel: { color: theme.colors.muted, fontWeight: '800', fontSize: 12 },
  matchValue: { color: theme.colors.text, fontSize: 42, fontWeight: '900', marginVertical: 5 },
  matchText: { color: theme.colors.muted, lineHeight: 20, fontSize: 13 },
  panel: { marginVertical: 16, backgroundColor: theme.colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: theme.colors.line },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lockIcon: { fontSize: 54, color: theme.colors.mirror },
  lockTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 12 },
  lockText: { color: theme.colors.muted, fontSize: 14, marginTop: 8 },
});
