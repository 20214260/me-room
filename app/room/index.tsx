import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { similarity } from '@/src/utils/persona';
import { theme } from '@/src/constants/theme';

export default function RoomScreen() {
  const { self, ideal, mirror, responses } = useApp();
  const balance = useMemo(() => {
    if (!self || !ideal) return 0;
    if (!mirror) return similarity(self.scores, ideal.scores);
    const values = [
      similarity(self.scores, ideal.scores),
      similarity(self.scores, mirror.scores),
      similarity(mirror.scores, ideal.scores),
    ];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [self, ideal, mirror]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>MY ROOM</Text>
          <Text style={styles.title}>세 명의 나</Text>
        </View>
        <View style={styles.balance}><Text style={styles.balanceLabel}>방의 균형</Text><Text style={styles.balanceValue}>{balance}%</Text></View>
      </View>

      <View style={styles.room}>
        <View style={styles.wallArt}><Text style={styles.wallArtText}>ME : ROOM</Text></View>
        <View style={styles.window}><View style={styles.windowLineV} /><View style={styles.windowLineH} /></View>
        <View style={styles.shelf}><View style={styles.book} /><View style={styles.book2} /><View style={styles.plant}><Text>✦</Text></View></View>
        <View style={styles.floorLine} />
        <View style={styles.characters}>
          <View style={styles.slot}>
            <PersonaAvatar type="SELF" size={86} />
            <Text style={styles.type}>SELF</Text>
            <Text style={styles.name} numberOfLines={2}>{self?.title ?? '아직 없음'}</Text>
          </View>
          <Pressable style={styles.slot} onPress={() => !mirror && router.push('/mirror/invite')}>
            <PersonaAvatar type="MIRROR" size={86} locked={!mirror} />
            <Text style={styles.type}>MIRROR</Text>
            <Text style={styles.name} numberOfLines={2}>{mirror?.title ?? `${responses.length}/3 응답`}</Text>
          </Pressable>
          <View style={styles.slot}>
            <PersonaAvatar type="IDEAL" size={86} />
            <Text style={styles.type}>IDEAL</Text>
            <Text style={styles.name} numberOfLines={2}>{ideal?.title ?? '아직 없음'}</Text>
          </View>
        </View>
      </View>

      {!mirror ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>세 번째 자리가 비어 있어요.</Text>
          <Text style={styles.noticeText}>친구 3명의 응답이 모이면 MIRROR가 입주합니다. 현재 {responses.length}/3명이 응답했어요.</Text>
        </View>
      ) : (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>세 명의 내가 모두 모였어요.</Text>
          <Text style={styles.noticeText}>이제 내가 보는 나와 타인이 보는 나, 되고 싶은 나 사이의 차이를 비교할 수 있습니다.</Text>
        </View>
      )}

      <View style={styles.actions}>
        {!mirror ? <PrimaryButton label="친구에게 MIRROR 요청하기" onPress={() => router.push('/mirror/invite')} /> : <PrimaryButton label="세 가지 나 비교하기" onPress={() => router.push('/compare')} />}
        <View style={{ height: 10 }} />
        <PrimaryButton label="오늘의 한 조각 기록" variant="light" onPress={() => router.push('/daily')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  kicker: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '900', marginTop: 4 },
  balance: { alignItems: 'flex-end' },
  balanceLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '700' },
  balanceValue: { color: theme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 2 },
  room: { minHeight: 350, backgroundColor: '#EEE7DC', borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: '#DED5C7', position: 'relative', paddingTop: 28 },
  wallArt: { position: 'absolute', top: 24, left: 22, width: 92, height: 54, backgroundColor: '#FBFAF7', borderWidth: 5, borderColor: '#D0C2B2', alignItems: 'center', justifyContent: 'center' },
  wallArtText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: theme.colors.text },
  window: { position: 'absolute', top: 24, right: 22, width: 80, height: 88, backgroundColor: '#DDE7ED', borderWidth: 6, borderColor: '#C2B5A7' },
  windowLineV: { position: 'absolute', width: 3, height: '100%', backgroundColor: '#C2B5A7', left: '48%' },
  windowLineH: { position: 'absolute', height: 3, width: '100%', backgroundColor: '#C2B5A7', top: '48%' },
  shelf: { position: 'absolute', left: 28, bottom: 82, width: 94, height: 12, backgroundColor: '#BCA992', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8 },
  book: { width: 10, height: 30, backgroundColor: theme.colors.self, marginRight: 3 },
  book2: { width: 12, height: 22, backgroundColor: theme.colors.mirror, marginRight: 8 },
  plant: { width: 27, height: 30, borderRadius: 9, backgroundColor: '#C6D3B7', alignItems: 'center', justifyContent: 'center' },
  floorLine: { position: 'absolute', left: 0, right: 0, bottom: 118, height: 2, backgroundColor: '#D6CAB9' },
  characters: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingHorizontal: 10, paddingBottom: 22, paddingTop: 90 },
  slot: { width: '31%', alignItems: 'center' },
  type: { fontSize: 10, letterSpacing: 1.3, fontWeight: '900', color: theme.colors.muted, marginTop: 2 },
  name: { marginTop: 4, color: theme.colors.text, fontWeight: '800', fontSize: 11, textAlign: 'center', minHeight: 30 },
  notice: { marginTop: 16, backgroundColor: theme.colors.surface, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: theme.colors.line },
  noticeTitle: { color: theme.colors.text, fontWeight: '900', fontSize: 15 },
  noticeText: { color: theme.colors.muted, lineHeight: 20, fontSize: 13, marginTop: 6 },
  actions: { marginTop: 16 },
});
