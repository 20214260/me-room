import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { TagChip } from '@/src/components/TagChip';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { idealTags } from '@/src/constants/traits';
import { theme } from '@/src/constants/theme';
import { createPersona, scoresFromTags } from '@/src/utils/persona';
import { useApp } from '@/src/context/AppContext';

export default function IdealForm() {
  const { setIdeal } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const submit = () => {
    const picked = idealTags.filter((tag) => selected.includes(tag.id));
    const scores = scoresFromTags(picked);
    const keywords = picked.map((tag) => tag.label);
    if (goal.trim()) keywords.unshift(goal.trim().slice(0, 18));
    setIdeal(createPersona('IDEAL', scores, keywords));
    router.push('/ideal/result');
  };

  return (
    <Screen>
      <PageTitle eyebrow="STEP 2 · IDEAL" title="어떤 사람에 가까워지고 싶나요?" description="현재의 나와 달라도 괜찮습니다. 원하는 모습을 2~4개 골라주세요." />
      <View style={styles.chips}>
        {idealTags.map((tag) => <TagChip key={tag.id} label={tag.label} selected={selected.includes(tag.id)} onPress={() => toggle(tag.id)} />)}
      </View>
      <Text style={styles.label}>가장 중요한 목표 한 문장</Text>
      <TextInput style={styles.input} value={goal} onChangeText={setGoal} placeholder="예: 완벽하게 준비될 때까지 기다리지 않고 먼저 시작하고 싶어요." placeholderTextColor="#A2A0A6" multiline maxLength={120} />
      <Text style={styles.count}>{selected.length}/4 선택</Text>
      <PrimaryButton label="IDEAL 만들기" disabled={selected.length < 2} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  label: { color: theme.colors.text, fontWeight: '800', fontSize: 14, marginBottom: 9 },
  input: { minHeight: 118, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 18, padding: 16, color: theme.colors.text, textAlignVertical: 'top', lineHeight: 21 },
  count: { textAlign: 'right', color: theme.colors.muted, fontSize: 12, marginTop: 8, marginBottom: 18 },
});
