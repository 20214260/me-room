import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PersonaCard } from '@/src/components/PersonaCard';
import { PageTitle } from '@/src/components/PageTitle';
import { ScoreBar } from '@/src/components/ScoreBar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { scoreLabels } from '@/src/types/persona';
import { similarity } from '@/src/utils/persona';
import { theme } from '@/src/constants/theme';
import { supabase } from '@/src/services/supabase';
import { getLatestFriendSurvey } from '@/src/services/surveyService';

export default function MirrorResult() {
  const { self, mirror, refreshMirror } = useApp();
  const [responseCount, setResponseCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadResponseCount = async () => {
        if (!supabase) return;

        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) return;

          const latestSurvey = await getLatestFriendSurvey(user.id);

          if (isActive) {
            setResponseCount(latestSurvey?.response_count ?? 0);
          }
        } catch (error) {
          console.error('MIRROR 응답 수 불러오기 실패:', error);
        }
      };

      loadResponseCount();
      refreshMirror();

      return () => {
        isActive = false;
      };
    }, [refreshMirror]),
  );

  if (!mirror) {
    return (
      <Screen scroll={false}>
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>◇</Text>
          <Text style={styles.lockTitle}>아직 MIRROR가 도착하지 않았어요.</Text>
          <Text style={styles.lockText}>
            친구 3명의 응답이 모이면 남들이 보는 나를 확인할 수 있어요.
          </Text>
        </View>
      </Screen>
    );
  }

  const sim = self
    ? similarity(self.scores, mirror.scores)
    : 0;

  return (
    <Screen>
      <PageTitle
        eyebrow="MIRROR UNLOCKED"
        title="남들이 보는 내가 도착했어요."
        description={`${responseCount}명의 응답을 바탕으로 구성한 MIRROR입니다.`}
      />

      <PersonaCard persona={mirror} />

      <View style={styles.matchBox}>
        <Text style={styles.matchLabel}>
          SELF ↔ MIRROR 자기인식 일치도
        </Text>

        <Text style={styles.matchValue}>{sim}%</Text>

        <Text style={styles.matchText}>
          {sim >= 75
            ? '내가 생각하는 나와 주변이 보는 내가 꽤 비슷합니다.'
            : '내가 생각하는 나와 주변이 보는 나 사이에 흥미로운 차이가 있습니다.'}
        </Text>
      </View>

      <View style={styles.panel}>
        {(Object.keys(mirror.scores) as (keyof typeof mirror.scores)[]).map(
          (key) => (
            <ScoreBar
              key={key}
              label={scoreLabels[key]}
              value={mirror.scores[key]}
              color={theme.colors.mirror}
            />
          ),
        )}
      </View>

      <PrimaryButton
        label="세 가지 나 비교하기"
        onPress={() => router.push('/compare')}
      />

      <View style={{ height: 10 }} />

      <PrimaryButton
        label="친구에게 MIRROR 더 물어보기"
        variant="light"
        onPress={() => router.push('/mirror/invite')}
      />

      <View style={{ height: 10 }} />

      <PrimaryButton
        label="우리 방으로 돌아가기"
        variant="light"
        onPress={() => router.replace('/room')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  matchBox: {
    marginTop: 16,
    backgroundColor: theme.colors.softPink,
    borderRadius: 22,
    padding: 20,
  },

  matchLabel: {
    color: theme.colors.muted,
    fontWeight: '800',
    fontSize: 12,
  },

  matchValue: {
    color: theme.colors.text,
    fontSize: 42,
    fontWeight: '900',
    marginVertical: 5,
  },

  matchText: {
    color: theme.colors.muted,
    lineHeight: 20,
    fontSize: 13,
  },

  panel: {
    marginVertical: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },

  locked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockIcon: {
    fontSize: 54,
    color: theme.colors.mirror,
  },

  lockTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },

  lockText: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
});