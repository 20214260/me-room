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

import { selfTags } from '@/src/constants/traits';
import { theme } from '@/src/constants/theme';

import { createPersona, scoresFromTags } from '@/src/utils/persona';
import { useApp } from '@/src/context/AppContext';

import { supabase } from '@/src/services/supabase';
import { savePersona } from '@/src/services/personaService';

export default function SelfForm() {
  const { setSelf } = useApp();

  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 5
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

      const picked = selfTags.filter((tag) =>
        selected.includes(tag.id),
      );

      const scores = scoresFromTags(picked);

      const keywords = picked.map((tag) => tag.label);

      if (answer.trim()) {
        keywords.unshift(answer.trim().slice(0, 18));
      }

      const persona = createPersona('SELF', scores, keywords);

      const savedPersona = await savePersona(
        user.id,
        persona,
      );

      setSelf(savedPersona);

      router.push('/self/result');
    } catch (error) {
      console.error(error);

      Alert.alert(
        'SELF 저장 실패',
        error instanceof Error
          ? error.message
          : 'SELF를 저장하는 중 문제가 발생했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageTitle
        eyebrow="STEP 1 · SELF"
        title="나는 나를 어떻게 보고 있나요?"
        description="지금의 나와 가장 가까운 태그를 3~5개 골라주세요."
      />

      <View style={styles.chips}>
        {selfTags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.label}
            selected={selected.includes(tag.id)}
            onPress={() => toggle(tag.id)}
          />
        ))}
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

      <Text style={styles.count}>
        {selected.length}/5 선택
      </Text>

      <PrimaryButton
        label={saving ? '저장 중...' : 'SELF 분석하기'}
        disabled={selected.length < 3 || saving}
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