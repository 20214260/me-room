import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PersonaCard } from '@/src/components/PersonaCard';
import { ScoreBar } from '@/src/components/ScoreBar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PageTitle } from '@/src/components/PageTitle';
import { useApp } from '@/src/context/AppContext';
import { scoreLabels } from '@/src/types/persona';
import { theme } from '@/src/constants/theme';


export default function SelfResult() {
  const { self, ideal } = useApp();

  if (!self) return null;

  return (
    <Screen>
      <PageTitle
        eyebrow="SELF CREATED"
        title="첫 번째 내가 만들어졌어요."
        description="지금 이 결과는 프론트 시연용 점수 계산으로 생성되며, 이후 AI 분석 API로 교체할 수 있습니다."
      />

      <PersonaCard persona={self} />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>6가지 성향</Text>

        {(Object.keys(self.scores) as (keyof typeof self.scores)[]).map((key) => (
          <ScoreBar
            key={key}
            label={scoreLabels[key]}
            value={self.scores[key]}
            color={theme.colors.self}
          />
        ))}
      </View>

      <PrimaryButton
        label={ideal ? '저장된 IDEAL 보기' : '되고 싶은 나 만들기'}
        onPress={() =>
          ideal
            ? router.push('/ideal/result')
            : router.push('/ideal/form')
        }
      />
    </Screen>
  );
}


const styles = StyleSheet.create({
  panel: {
    marginVertical: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },

  panelTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 16,
  },
});