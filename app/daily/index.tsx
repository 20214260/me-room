import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { theme } from '@/src/constants/theme';

export default function DailyLog() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <Screen scroll={false}>
        <View style={styles.result}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.resultTitle}>오늘의 한 조각이 기록됐어요.</Text>
          <Text style={styles.resultText}>현재 버전에서는 화면 흐름만 구현되어 있습니다. 추후 AI 분석 결과로 SELF 점수를 조금씩 업데이트할 수 있습니다.</Text>
          <View style={styles.change}><Text style={styles.changeText}>예시 변화 · 주도성 +2 · 실행력 +1</Text></View>
          <View style={{ width: '100%', marginTop: 20 }}><PrimaryButton label="ROOM으로 돌아가기" onPress={() => router.replace('/room')} /></View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageTitle eyebrow="DAILY PIECE" title="오늘의 나를 한 조각 남겨주세요." description="거창한 일기보다 오늘 나답다고 느꼈던 한 장면이면 충분합니다." />
      <View style={styles.examples}>
        <Text style={styles.exampleTitle}>예시</Text>
        <Text style={styles.example}>• 오늘 먼저 의견을 말했다.</Text>
        <Text style={styles.example}>• 싫은 부탁을 처음으로 거절했다.</Text>
        <Text style={styles.example}>• 낯선 사람에게 먼저 말을 걸었다.</Text>
      </View>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="오늘의 한 장면을 적어주세요."
        placeholderTextColor="#A2A0A6"
        multiline
        maxLength={180}
      />
      <Text style={styles.count}>{text.length}/180</Text>
      <PrimaryButton label="오늘의 조각 저장" disabled={text.trim().length < 5} onPress={() => setSaved(true)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  examples: { backgroundColor: theme.colors.softPurple, borderRadius: 20, padding: 16, marginBottom: 16 },
  exampleTitle: { color: theme.colors.self, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  example: { color: theme.colors.text, fontSize: 13, lineHeight: 21 },
  input: { minHeight: 180, backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.line, color: theme.colors.text, padding: 16, textAlignVertical: 'top', fontSize: 15, lineHeight: 23 },
  count: { textAlign: 'right', color: theme.colors.muted, fontSize: 11, marginTop: 7, marginBottom: 18 },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { color: theme.colors.ideal, fontSize: 52 },
  resultTitle: { color: theme.colors.text, fontSize: 26, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  resultText: { color: theme.colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  change: { backgroundColor: theme.colors.softGold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, marginTop: 18 },
  changeText: { color: theme.colors.text, fontSize: 12, fontWeight: '800' },
});
