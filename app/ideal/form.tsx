import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { TagChip } from '@/src/components/TagChip';
import { PrimaryButton } from '@/src/components/PrimaryButton';

import { idealTags } from '@/src/constants/traits';
import { theme } from '@/src/constants/theme';

import { createPersona, scoresFromTags } from '@/src/utils/persona';
import { useApp } from '@/src/context/AppContext';

import { supabase } from '@/src/services/supabase';
import { savePersona } from '@/src/services/personaService';

export default function IdealForm() {
  const { setIdeal } = useApp();

  const [selected, setSelected] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev,
    );
  };

  const submit = async () => {
    if (!supabase) {
      Alert.alert('오류', 'Supabase가 연결되어 있지 않습니다.');
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

      const picked = idealTags.filter((tag) =>
        selected.includes(tag.id),
      );

      const scores = scoresFromTags(picked);

      const keywords = picked.map((tag) => tag.label);

      if (goal.trim()) {
        keywords.unshift(goal.trim().slice(0, 18));
      }

      const persona = createPersona(
        'IDEAL',
        scores,
        keywords,
      );

      const savedPersona = await savePersona(
        user.id,
        persona,
      );

      setIdeal(savedPersona);

      router.push('/ideal/result');
    } catch (error) {
      console.error(error);

      Alert.alert(
        'IDEAL 저장 실패',
        error instanceof Error
          ? error.message
          : 'IDEAL을 저장하는 중 문제가 발생했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageTitle
        eyebrow="STEP 2 · IDEAL"
        title="어떤 사람에 가까워지고 싶나요?"
        description="현재의 나와 달라도 괜찮습니다. 원하는 모습을 2~4개 골라주세요."
      />

      <View style={styles.chips}>
        {idealTags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.label}
            selected={selected.includes(tag.id)}
            onPress={() => toggle(tag.id)}
          />
        ))}
      </View>

      <Text style={styles.label}>
        가장 중요한 목표 한 문장
      </Text>

      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        placeholder="예: 완벽하게 준비될 때까지 기다리지 않고 먼저 시작하고 싶어요."
        placeholderTextColor="#A2A0A6"
        multiline
        maxLength={120}
      />

      <Text style={styles.count}>
        {selected.length}/4 선택
      </Text>

      <PrimaryButton
        label={saving ? '저장 중...' : 'IDEAL 만들기'}
        disabled={selected.length < 2 || saving}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },

  label: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 9,
  },

  input: {
    minHeight: 118,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 18,
    padding: 16,
    color: theme.colors.text,
    textAlignVertical: 'top',
    lineHeight: 21,
  },

  count: {
    textAlign: 'right',
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 18,
  },
});