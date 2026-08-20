import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/AppContext';
import { supabase } from '@/src/services/supabase';
import { analyzeDailyPiece } from '@/src/services/aiService';
import { saveDailyLog } from '@/src/services/dailyService';
import { savePersona } from '@/src/services/personaService';
import { applyDailyDeltas, fallbackDailyAnalysis } from '@/src/utils/personaEvolution';
import { PersonaScores, scoreLabels } from '@/src/types/persona';

export default function DailyLog() {
  const { self, setSelf } = useApp();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insight, setInsight] = useState('');
  const [changeText, setChangeText] = useState('');

  const save = async () => {
    if (!supabase || !self) {
      Alert.alert('저장 실패', '로그인 상태와 SELF 정보를 확인해주세요.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('로그인 정보를 확인할 수 없습니다.');
      }

      let analysis = fallbackDailyAnalysis(self, text.trim());

      try {
        const aiAnalysis = await analyzeDailyPiece({
          currentPersona: self,
          text: text.trim(),
        });

        if (aiAnalysis) analysis = aiAnalysis;
      } catch (aiError) {
        // AI가 잠시 실패해도 오늘의 기록과 작은 SELF 변화는 저장됩니다.
        console.warn('DAILY AI 분석 실패 - 기본 분석 사용:', aiError);
      }

      // 핵심 안전장치: AI가 어떤 값을 주더라도 하루 변화량은 각 지표 ±3을 넘지 않음.
      const { scores, deltas } = applyDailyDeltas(self.scores, analysis.deltas);

      const updatedSelf = {
        ...self,
        title: analysis.title || self.title,
        summary: analysis.summary || self.summary,
        keywords: analysis.keywords?.length ? analysis.keywords.slice(0, 4) : self.keywords,
        scores,
      };

      const savedPersona = await savePersona(user.id, updatedSelf);
      setSelf(savedPersona);

      try {
        await saveDailyLog({
          userId: user.id,
          text: text.trim(),
          scoreDelta: deltas,
          insight: analysis.insight,
        });
      } catch (logError) {
        console.warn('오늘의 한 조각 로그 저장 실패:', logError);
      }

      setInsight(analysis.insight);
      setChangeText(formatChanges(deltas));
      setSaved(true);
    } catch (error) {
      console.error(error);
      Alert.alert(
        '오늘의 조각 저장 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <Screen scroll={false}>
        <View style={styles.result}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.resultTitle}>오늘의 한 조각이 기록됐어요.</Text>
          <Text style={styles.resultText}>
            {insight || '오늘의 행동을 바탕으로 SELF에 작은 변화를 반영했어요.'}
          </Text>
          <View style={styles.change}>
            <Text style={styles.changeText}>{changeText}</Text>
          </View>
          <View style={{ width: '100%', marginTop: 20 }}>
            <PrimaryButton label="ROOM으로 돌아가기" onPress={() => router.replace('/room')} />
          </View>
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
      <PrimaryButton
        label={saving ? '분석하고 저장 중...' : '오늘의 조각 저장'}
        disabled={text.trim().length < 5 || saving}
        onPress={save}
      />
    </Screen>
  );
}

function formatChanges(deltas: PersonaScores) {
  const entries = (Object.keys(deltas) as (keyof PersonaScores)[])
    .filter((key) => deltas[key] !== 0)
    .map((key) => `${scoreLabels[key]} ${deltas[key] > 0 ? '+' : ''}${deltas[key]}`);

  return entries.length
    ? `오늘의 변화 · ${entries.join(' · ')}`
    : '오늘의 변화 · 큰 점수 변화 없이 기록을 남겼어요.';
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
  changeText: { color: theme.colors.text, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
