import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { TagChip } from '@/src/components/TagChip';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { selfTags } from '@/src/constants/traits';
import { theme } from '@/src/constants/theme';
import { createPersona, scoresFromTags } from '@/src/utils/persona';
import { useApp } from '@/src/context/AppContext';

export default function SelfForm() {
  const { setSelf } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  const submit = () => {
    const picked = selfTags.filter((tag) => selected.includes(tag.id));
    const scores = scoresFromTags(picked);
    const keywords = picked.map((tag) => tag.label);
    if (answer.trim()) keywords.unshift(answer.trim().slice(0, 18));
    setSelf(createPersona('SELF', scores, keywords));
    router.push('/self/result');
  };

  return (
    <Screen>
      <PageTitle eyebrow="STEP 1 · SELF" title="나는 나를 어떻게 보고 있나요?" description="지금의 나와 가장 가까운 태그를 3~5개 골라주세요." />
      <View style={styles.chips}>
        {selfTags.map((tag) => <TagChip key={tag.id} label={tag.label} selected={selected.includes(tag.id)} onPress={() => toggle(tag.id)} />)}
      </View>
      <Text style={styles.label}>한 문장으로 덧붙이기</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="예: 친해지기 전에는 조용하지만 가까워지면 말이 많아요."
        placeholderTextColor="#A2A0A6"
        multiline
        maxLength={120}
      />
      <Text style={styles.count}>{selected.length}/5 선택</Text>
      <PrimaryButton label="SELF 분석하기" disabled={selected.length < 3} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  label: { color: theme.colors.text, fontWeight: '800', fontSize: 14, marginBottom: 9 },
  input: { minHeight: 118, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 18, padding: 16, color: theme.colors.text, textAlignVertical: 'top', lineHeight: 21 },
  count: { textAlign: 'right', color: theme.colors.muted, fontSize: 12, marginTop: 8, marginBottom: 18 },
});
