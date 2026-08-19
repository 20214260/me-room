import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { PageTitle } from '@/src/components/PageTitle';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';

import { theme } from '@/src/constants/theme';

import { supabase } from '@/src/services/supabase';

import {
  getOrCreateFriendSurvey,
} from '@/src/services/surveyService';

type Survey = {
  id: string;
  user_id: string;
  token: string;
  status: string;
  response_count: number;
  min_responses: number;
};

export default function MirrorInvite() {
  const [survey, setSurvey] =
    useState<Survey | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadSurvey = useCallback(
    async () => {
      if (!supabase) {
        setLoading(false);
        Alert.alert(
          '오류',
          'Supabase 연결 정보를 확인해주세요.',
        );
        return;
      }

      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            '로그인 정보를 확인할 수 없습니다.',
          );
        }

        const data =
          await getOrCreateFriendSurvey(
            user.id,
          );

        if (!data) {
          throw new Error(
            '친구 설문을 생성할 수 없습니다.',
          );
        }

        setSurvey(data as Survey);
      } catch (error) {
        console.error(error);

        Alert.alert(
          'MIRROR 설문 오류',
          error instanceof Error
            ? error.message
            : '설문을 불러오는 중 문제가 발생했습니다.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadSurvey();
    }, [loadSurvey]),
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            MIRROR 설문 준비 중...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!survey) {
    return (
      <Screen>
        <PageTitle
          eyebrow="STEP 3 · MIRROR"
          title="설문을 준비할 수 없어요."
          description="잠시 후 다시 시도해주세요."
        />

        <PrimaryButton
          label="다시 시도"
          onPress={loadSurvey}
        />
      </Screen>
    );
  }

  const responseCount =
    survey.response_count ?? 0;

  const minResponses =
    survey.min_responses ?? 3;

  const isComplete =
    responseCount >= minResponses ||
    survey.status === 'closed';

  const progress =
    Math.min(
      100,
      (responseCount / minResponses) * 100,
    );

  // 실제 웹 배포 후 이 주소는 배포 URL로 교체
  const shareUrl =
    `meroom://survey/${survey.token}`;

  const share = async () => {
    await Share.share({
      message:
        `내가 모르는 나를 만들어주세요. ` +
        `1분이면 끝나요!\n\n` +
        `${shareUrl}`,
    });
  };

  return (
    <Screen>
      <PageTitle
        eyebrow="STEP 3 · MIRROR"
        title="친구들이 보는 나를 모아볼까요?"
        description="익명 응답 3개가 모이면 MIRROR 캐릭터를 분석할 준비가 완료됩니다."
      />

      <View style={styles.hero}>
        <PersonaAvatar
          type="MIRROR"
          locked={!isComplete}
          size={120}
        />

        <Text style={styles.count}>
          {responseCount} / {minResponses}
        </Text>

        <Text style={styles.status}>
          {isComplete
            ? 'MIRROR 분석 준비 완료!'
            : `MIRROR까지 ${Math.max(
                0,
                minResponses -
                  responseCount,
              )}명 남음`}
        </Text>

        <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.linkBox}>
        <Text style={styles.linkLabel}>
          설문 토큰
        </Text>

        <Text style={styles.token}>
          {survey.token}
        </Text>

        <Text
          style={styles.link}
          numberOfLines={1}
        >
          {shareUrl}
        </Text>
      </View>

      <PrimaryButton
        label="친구에게 링크 공유"
        onPress={share}
      />

      <View style={{ height: 10 }} />

      {!isComplete ? (
        <PrimaryButton
          label="친구 설문 미리보기 / 직접 응답"
          variant="light"
          onPress={() =>
            router.push(
              `/survey/${survey.token}`,
            )
          }
        />
      ) : (
        <PrimaryButton
          label="우리 방으로 돌아가기"
          variant="light"
          onPress={() =>
            router.push('/room')
          }
        />
      )}

      <View style={{ height: 10 }} />

      <PrimaryButton
        label="응답 현황 새로고침"
        variant="light"
        onPress={loadSurvey}
      />

      <Text style={styles.note}>
        현재는 개발 단계이므로 공유 링크는 앱용
        링크입니다. 최종 배포 후 친구가 설치 없이
        브라우저에서 설문에 참여할 수 있는 웹 URL로
        연결합니다.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor:
      theme.colors.softPink,
    borderRadius: 28,
    padding: 26,
    marginBottom: 16,
  },

  count: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },

  status: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  progress: {
    width: '100%',
    height: 8,
    backgroundColor: '#F2D4DF',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 15,
  },

  progressFill: {
    height: '100%',
    backgroundColor:
      theme.colors.mirror,
    borderRadius: 999,
  },

  linkBox: {
    backgroundColor:
      theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },

  linkLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 5,
  },

  token: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  link: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  note: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
    textAlign: 'center',
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },

  loadingText: {
    color: theme.colors.muted,
    marginTop: 12,
  },
});