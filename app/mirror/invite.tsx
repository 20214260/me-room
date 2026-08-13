import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';
import { useApp } from '@/src/context/AppContext';
import { theme } from '@/src/constants/theme';

export default function MirrorInvite() {
  const { responses, surveyToken, mirror } = useApp();
  const shareUrl = `https://me-room.example/survey/${surveyToken}`;
  const share = async () => {
    await Share.share({ message: `내가 모르는 나를 만들어주세요. 1분이면 끝나요!\n${shareUrl}` });
  };
  return (
    <Screen>
      <PageTitle eyebrow="STEP 3 · MIRROR" title="친구들이 보는 나를 모아볼까요?" description="익명 응답 3개가 모이면 MIRROR 캐릭터가 만들어집니다." />
      <View style={styles.hero}>
        <PersonaAvatar type="MIRROR" locked={!mirror} size={120} />
        <Text style={styles.count}>{responses.length} / 3</Text>
        <Text style={styles.status}>{mirror ? 'MIRROR 생성 완료' : `MIRROR까지 ${Math.max(0, 3 - responses.length)}명 남음`}</Text>
        <View style={styles.progress}><View style={[styles.progressFill, { width: `${Math.min(100, responses.length / 3 * 100)}%` }]} /></View>
      </View>

      <View style={styles.linkBox}>
        <Text style={styles.linkLabel}>공유 링크</Text>
        <Text style={styles.link} numberOfLines={1}>{shareUrl}</Text>
      </View>

      <PrimaryButton label="친구에게 링크 공유" onPress={share} />
      <View style={{ height: 10 }} />
      {!mirror ? (
        <PrimaryButton label="친구 설문 미리보기 / 직접 응답" variant="light" onPress={() => router.push(`/survey/${surveyToken}`)} />
      ) : (
        <PrimaryButton label="MIRROR 결과 보기" variant="light" onPress={() => router.push('/mirror/result')} />
      )}
      <Text style={styles.note}>실제 배포 시 URL은 배포된 웹 주소로 교체합니다. 현재 데모에는 친구 응답 2개가 미리 들어 있습니다.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', backgroundColor: theme.colors.softPink, borderRadius: 28, padding: 26, marginBottom: 16 },
  count: { color: theme.colors.text, fontSize: 34, fontWeight: '900', marginTop: 4 },
  status: { color: theme.colors.muted, fontSize: 13, fontWeight: '700', marginTop: 3 },
  progress: { width: '100%', height: 8, backgroundColor: '#F2D4DF', borderRadius: 999, overflow: 'hidden', marginTop: 15 },
  progressFill: { height: '100%', backgroundColor: theme.colors.mirror, borderRadius: 999 },
  linkBox: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 18, padding: 15, marginBottom: 14 },
  linkLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 5 },
  link: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  note: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 13, textAlign: 'center' },
});
