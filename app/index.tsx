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
import { router } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { Screen } from '@/src/components/Screen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';
import { theme } from '@/src/constants/theme';
import { supabase } from '@/src/services/supabase';
import { useApp } from '@/src/context/AppContext';

export default function Home() {
  const { self, ideal } = useApp();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 로그인 세션 확인
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 이미 SELF와 IDEAL을 만든 사용자는 바로 ROOM으로 이동
  useEffect(() => {
    if (session && self && ideal) {
      router.replace('/room');
    }
  }, [session, self, ideal]);

  async function handleAuth() {
    if (!supabase) {
      Alert.alert('오류', 'Supabase 연결 정보를 확인해주세요.');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('확인', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          Alert.alert('회원가입 실패', error.message);
          return;
        }

        if (!data.session) {
          Alert.alert(
            '회원가입 완료',
            '이메일 인증이 필요한 경우 메일함을 확인해주세요.',
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          Alert.alert('로그인 실패', error.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('로그아웃 실패', error.message);
    }
  }

  if (authLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
        </View>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen scroll={false}>
        <View style={styles.authContainer}>
          <View>
            <Text style={styles.logo}>ME:ROOM</Text>
            <Text style={styles.kicker}>THREE VERSIONS OF ME</Text>
          </View>

          <View style={styles.authBox}>
            <Text style={styles.authTitle}>
              {isSignUp ? '회원가입' : '로그인'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <PrimaryButton
              label={
                submitting
                  ? '처리 중...'
                  : isSignUp
                    ? '회원가입'
                    : '로그인'
              }
              onPress={handleAuth}
            />

            <Pressable
              onPress={() => setIsSignUp((previous) => !previous)}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? '이미 계정이 있나요? 로그인'
                  : '계정이 없나요? 회원가입'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={styles.top}>
        <View>
          <Text style={styles.logo}>ME:ROOM</Text>
          <Text style={styles.kicker}>THREE VERSIONS OF ME</Text>
        </View>

        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>로그아웃</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatarRow}>
          <PersonaAvatar type="SELF" size={82} />
          <PersonaAvatar type="MIRROR" size={82} locked />
          <PersonaAvatar type="IDEAL" size={82} />
        </View>

        <Text style={styles.title}>
          내 안의 세 사람이{'\n'}한 방에 산다면?
        </Text>

        <Text style={styles.description}>
          내가 보는 나, 남들이 보는 나, 되고 싶은 나를 캐릭터로 만들고 서로의
          거리를 확인해보세요.
        </Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label={self ? '저장된 SELF 보기' : '세 명의 나 만나기'}
          onPress={() =>
            self
              ? router.push('/self/result')
              : router.push('/onboarding')
          }
        />

        <Text style={styles.demo}>
          SELF · MIRROR · IDEAL, 세 가지 시선으로 나를 발견해보세요.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  logo: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: theme.colors.text,
  },

  kicker: {
    marginTop: 3,
    fontSize: 10,
    letterSpacing: 1.8,
    color: theme.colors.muted,
    fontWeight: '700',
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
  },

  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  title: {
    fontSize: 36,
    lineHeight: 45,
    letterSpacing: -1.2,
    color: theme.colors.text,
    fontWeight: '900',
  },

  description: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 25,
    color: theme.colors.muted,
  },

  bottom: {
    paddingBottom: 8,
  },

  demo: {
    textAlign: 'center',
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 12,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: theme.colors.muted,
  },

  authContainer: {
    flex: 1,
    paddingTop: 40,
  },

  authBox: {
    flex: 1,
    justifyContent: 'center',
  },

  authTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
  },

  switchButton: {
    marginTop: 18,
    alignItems: 'center',
  },

  switchText: {
    color: theme.colors.muted,
    fontSize: 14,
  },

  logout: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});