import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { surveyQuestions } from '@/src/constants/questions';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/AppContext';
import { FriendResponse, SurveyAnswer } from '@/src/types/survey';
import { getSurveyByToken, submitFriendResponse } from '@/src/services/surveyService';
import { isSupabaseConfigured, supabase } from '@/src/services/supabase';

export default function FriendSurvey() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { addFriendResponse } = useApp();
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [checkingSurvey, setCheckingSurvey] = useState(true);
  const [surveyValid, setSurveyValid] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!isSupabaseConfigured || !token) {
        if (active) {
          setSurveyValid(false);
          setCheckingSurvey(false);
        }
        return;
      }

      try {
        const [survey, authResult] = await Promise.all([
          getSurveyByToken(token),
          supabase?.auth.getUser(),
        ]);

        if (active) {
          setSurveyValid(Boolean(survey));
          setSignedIn(Boolean(authResult?.data.user));
        }
      } catch (error) {
        console.error('친구 설문 확인 실패:', error);
        if (active) setSurveyValid(false);
      } finally {
        if (active) setCheckingSurvey(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [token]);

  const choose = (
    questionId: string,
    trait: string,
    label: string,
    value: number,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, trait, label, value },
    }));
  };

  const submit = async () => {
    if (!token || !surveyValid || Object.keys(answers).length !== surveyQuestions.length) return;

    const response: FriendResponse = {
      id: `local-${Date.now()}`,
      answers: Object.values(answers),
      comment: comment.trim(),
    };

    setSubmitting(true);

    try {
      await submitFriendResponse(token, response);
      addFriendResponse(response);
      setDone(true);
    } catch (error) {
      console.error('친구 설문 제출 실패:', error);
      Alert.alert('제출 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSurvey) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>설문을 확인하고 있어요...</Text>
        </View>
      </Screen>
    );
  }

  if (!surveyValid) {
    return (
      <Screen scroll={false}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneIcon}>!</Text>
          <Text style={styles.doneTitle}>열 수 없는 설문이에요.</Text>
          <Text style={styles.doneText}>
            링크가 잘못되었거나 더 이상 사용할 수 없는 설문입니다.
          </Text>
        </View>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen scroll={false}>
        <View style={styles.doneWrap}>
          <Text style={styles.doneIcon}>✓</Text>
          <Text style={styles.doneTitle}>응답이 전달됐어요.</Text>
          <Text style={styles.doneText}>
            당신의 시선이 이 사람의 MIRROR를 만드는 한 조각이 됩니다.
          </Text>
          <View style={{ width: '100%', marginTop: 24 }}>
            <PrimaryButton
              label={signedIn ? 'MIRROR 현황으로 돌아가기' : 'ME:ROOM 홈으로'}
              onPress={() =>
                signedIn
                  ? router.replace('/mirror/invite')
                  : router.replace('/')
              }
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.kicker}>FRIEND MIRROR</Text>
      <Text style={styles.title}>당신이 보는 이 사람은 어떤가요?</Text>
      <Text style={styles.desc}>
        정답은 없습니다. 가장 가까운 모습을 골라주세요. 응답은 개인별로 공개하지 않는 것을 전제로 합니다.
      </Text>

      {surveyQuestions.map((question, index) => (
        <View key={question.id} style={styles.question}>
          <Text style={styles.qNo}>Q{index + 1}</Text>
          <Text style={styles.qTitle}>{question.prompt}</Text>

          {question.options.map((option) => {
            const selected = answers[question.id]?.value === option.value;

            return (
              <Pressable
                key={option.label}
                onPress={() => choose(question.id, question.trait, option.label, option.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.question}>
        <Text style={styles.qNo}>LAST</Text>
        <Text style={styles.qTitle}>
          이 사람이 스스로 잘 모르고 있을 것 같은 장점이 있다면?
        </Text>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="선택 입력"
          placeholderTextColor="#A2A0A6"
          multiline
          maxLength={120}
        />
      </View>

      <PrimaryButton
        label={submitting ? '제출 중...' : '응답 보내기'}
        disabled={Object.keys(answers).length !== surveyQuestions.length || submitting}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: theme.colors.mirror, fontWeight: '900', letterSpacing: 1.3, fontSize: 11, marginTop: 8 },
  title: { color: theme.colors.text, fontSize: 30, lineHeight: 38, fontWeight: '900', marginTop: 8 },
  desc: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  question: { backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.line, padding: 17, marginBottom: 13 },
  qNo: { color: theme.colors.mirror, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  qTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', lineHeight: 23, marginTop: 6, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderRadius: 14, backgroundColor: theme.colors.background, paddingHorizontal: 13, marginBottom: 7 },
  optionSelected: { backgroundColor: theme.colors.softPink },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#BAB5AF', marginRight: 10 },
  radioSelected: { borderColor: theme.colors.mirror, backgroundColor: theme.colors.mirror },
  optionText: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  optionTextSelected: { fontWeight: '800' },
  input: { minHeight: 90, backgroundColor: theme.colors.background, borderRadius: 14, padding: 13, color: theme.colors.text, textAlignVertical: 'top' },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  doneIcon: { width: 72, height: 72, textAlign: 'center', textAlignVertical: 'center', borderRadius: 36, backgroundColor: theme.colors.softPink, color: theme.colors.mirror, fontWeight: '900', fontSize: 30 },
  doneTitle: { color: theme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 20, textAlign: 'center' },
  doneText: { color: theme.colors.muted, textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 10 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 500 },
  loadingText: { color: theme.colors.muted, marginTop: 12 },
});
