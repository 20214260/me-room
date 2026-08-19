import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { PersonaAvatar } from '@/src/components/PersonaAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { similarity } from '@/src/utils/persona';
import { theme } from '@/src/constants/theme';
import { supabase } from '@/src/services/supabase';
import { getLatestFriendSurvey } from '@/src/services/surveyService';

type CharacterType = 'SELF' | 'MIRROR' | 'IDEAL';

type RoomCharacterProps = {
  type: CharacterType;
  title: string;
  locked?: boolean;
  subtitle?: string;
  onPress: () => void;
  duration?: number;
};

function RoomCharacter({
  type,
  title,
  locked = false,
  subtitle,
  onPress,
  duration = 2200,
}: RoomCharacterProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [duration, floatAnim]);

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 10,
    }).start();
  };

  return (
    <View style={styles.characterSlot}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.characterPressable}
      >
        <Animated.View
          style={[
            styles.characterAnimated,
            {
              transform: [
                { translateY: floatAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <PersonaAvatar
            type={type}
            size={92}
            locked={locked}
          />
        </Animated.View>
      </Pressable>

      <Text style={styles.characterType}>{type}</Text>

      <Text style={styles.characterName} numberOfLines={2}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={styles.characterSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export default function RoomScreen() {
  const {
    self,
    ideal,
    mirror,
  } = useApp();

  const [responseCount, setResponseCount] = useState(0);

  const selfIdealSimilarity = useMemo(() => {
    if (!self || !ideal) return 0;

    return similarity(
      self.scores,
      ideal.scores,
    );
  }, [self, ideal]);

  const balance = useMemo(() => {
    if (!self || !ideal) return 0;

    if (!mirror) {
      return selfIdealSimilarity;
    }

    const values = [
      similarity(self.scores, ideal.scores),
      similarity(self.scores, mirror.scores),
      similarity(mirror.scores, ideal.scores),
    ];

    return Math.round(
      values.reduce((a, b) => a + b, 0) /
        values.length,
    );
  }, [
    self,
    ideal,
    mirror,
    selfIdealSimilarity,
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadRealSurveyCount = async () => {
        if (!supabase) return;

        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return;
          }

          const latestSurvey = await getLatestFriendSurvey(user.id);

          if (isActive) {
            setResponseCount(
              latestSurvey?.response_count ?? 0,
            );
          }
        } catch (error) {
          console.error('MIRROR 응답 수 불러오기 실패:', error);
        }
      };

      loadRealSurveyCount();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const responseProgress =
    Math.min(100, (responseCount / 3) * 100);

  const handleLogout = async () => {
    if (!supabase) {
      Alert.alert('오류', 'Supabase 연결 정보를 확인해주세요.');
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('로그아웃 실패', error.message);
      return;
    }

    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>
            MY ROOM
          </Text>

          <Text style={styles.title}>
            세 명의 나
          </Text>

          <Text style={styles.headerDescription}>
            캐릭터를 눌러 각자의 모습을 확인해보세요.
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>

          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>
              {mirror
                ? '방의 균형'
                : 'SELF ↔ IDEAL'}
            </Text>

            <Text style={styles.balanceValue}>
              {balance}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.room}>
        <View style={styles.wall} />

        <View style={styles.sunLight} />

        <View style={styles.wallArt}>
          <View style={styles.wallArtInner}>
            <Text style={styles.wallArtText}>
              ME : ROOM
            </Text>

            <Text style={styles.wallArtSub}>
              be all of you
            </Text>
          </View>
        </View>

        <View style={styles.window}>
          <View style={styles.sky} />

          <View style={styles.windowLineV} />
          <View style={styles.windowLineH} />

          <View style={styles.cloudOne} />
          <View style={styles.cloudTwo} />
        </View>

        <View style={styles.hangingLight}>
          <View style={styles.lightWire} />

          <View style={styles.lightShade}>
            <View style={styles.lightBulb} />
          </View>
        </View>

        <View style={styles.shelf}>
          <View style={styles.bookSelf} />
          <View style={styles.bookMirror} />
          <View style={styles.bookIdeal} />

          <View style={styles.plantPot}>
            <View style={styles.plantLeafOne} />
            <View style={styles.plantLeafTwo} />
          </View>
        </View>

        <View style={styles.floor} />

        <View style={styles.rug}>
          <View style={styles.rugInner} />
        </View>

        <View style={styles.characters}>
          <RoomCharacter
            type="SELF"
            title={self?.title ?? '아직 없음'}
            subtitle={
              self ? '내가 보는 나' : undefined
            }
            onPress={() => {
              if (self) {
                router.push('/self/result');
              }
            }}
            duration={2250}
          />

          <RoomCharacter
            type="MIRROR"
            title={
              mirror?.title ??
              `${responseCount}/3 응답`
            }
            subtitle={
              mirror
                ? '친구들이 보는 나'
                : '아직 입주 준비 중'
            }
            locked={!mirror}
            onPress={() =>
              mirror
                ? router.push('/mirror/result')
                : router.push('/mirror/invite')
            }
            duration={2500}
          />

          <RoomCharacter
            type="IDEAL"
            title={ideal?.title ?? '아직 없음'}
            subtitle={
              ideal
                ? '되고 싶은 나'
                : undefined
            }
            onPress={() => {
              if (ideal) {
                router.push('/ideal/result');
              }
            }}
            duration={2350}
          />
        </View>

        <View style={styles.floorShadow} />
      </View>

      {!mirror ? (
        <View style={styles.notice}>
          <View style={styles.noticeHeader}>
            <View>
              <Text style={styles.noticeEyebrow}>
                MIRROR MOVE-IN
              </Text>

              <Text style={styles.noticeTitle}>
                세 번째 자리가 비어 있어요.
              </Text>
            </View>

            <View style={styles.responseBadge}>
              <Text style={styles.responseBadgeText}>
                {responseCount}/3
              </Text>
            </View>
          </View>

          <Text style={styles.noticeText}>
            친구 3명의 응답이 모이면 MIRROR가
            입주합니다.
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${responseProgress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {responseCount === 0
              ? '아직 응답을 기다리고 있어요.'
              : responseCount === 1
                ? '첫 번째 친구가 답해줬어요!'
                : responseCount === 2
                  ? '한 명만 더 답하면 MIRROR가 입주해요.'
                  : 'MIRROR 입주 준비 완료!'}
          </Text>
        </View>
      ) : (
        <View style={styles.notice}>
          <View style={styles.noticeHeader}>
            <View>
              <Text style={styles.noticeEyebrow}>
                ROOM COMPLETE
              </Text>

              <Text style={styles.noticeTitle}>
                세 명의 내가 모두 모였어요.
              </Text>
            </View>

            <Text style={styles.completeIcon}>
              ✦
            </Text>
          </View>

          <Text style={styles.noticeText}>
            내가 보는 나, 친구들이 보는 나,
            되고 싶은 나 사이의 차이를
            비교해보세요.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {!mirror ? (
          <PrimaryButton
            label="친구에게 MIRROR 요청하기"
            onPress={() =>
              router.push('/mirror/invite')
            }
          />
        ) : (
          <>
            <PrimaryButton
              label="세 가지 나 비교하기"
              onPress={() =>
                router.push('/compare')
              }
            />

            <View style={styles.actionGap} />

            <PrimaryButton
              label="친구에게 MIRROR 더 물어보기"
              variant="light"
              onPress={() =>
                router.push('/mirror/invite')
              }
            />
          </>
        )}

        <View style={styles.actionGap} />

        <PrimaryButton
          label="오늘의 한 조각 기록"
          variant="light"
          onPress={() =>
            router.push('/daily')
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  kicker: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
  },

  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -1,
  },

  headerDescription: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    maxWidth: 220,
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.line,
  },

  logoutText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },

  balance: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,

    shadowColor: '#25222A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  balanceLabel: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '800',
  },

  balanceValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 1,
  },

  room: {
    height: 440,
    backgroundColor: '#F1E9DD',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DED3C4',
    position: 'relative',

    shadowColor: '#685D51',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 5,
  },

  wall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 315,
    backgroundColor: '#F3ECE2',
  },

  sunLight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 180,
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.17)',
    transform: [
      {
        rotate: '10deg',
      },
    ],
  },

  wallArt: {
    position: 'absolute',
    top: 28,
    left: 24,
    width: 104,
    height: 66,
    backgroundColor: '#CFC0AF',
    padding: 6,
    borderRadius: 4,
  },

  wallArtInner: {
    flex: 1,
    backgroundColor: '#FBF9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wallArtText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
    color: theme.colors.text,
  },

  wallArtSub: {
    marginTop: 3,
    fontSize: 6,
    letterSpacing: 1.1,
    color: theme.colors.muted,
  },

  window: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 88,
    height: 102,
    backgroundColor: '#C5B6A6',
    padding: 6,
  },

  sky: {
    flex: 1,
    backgroundColor: '#DCE9F0',
  },

  windowLineV: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: '50%',
    width: 4,
    marginLeft: -2,
    backgroundColor: '#C5B6A6',
  },

  windowLineH: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: '50%',
    height: 4,
    marginTop: -2,
    backgroundColor: '#C5B6A6',
  },

  cloudOne: {
    position: 'absolute',
    top: 25,
    left: 12,
    width: 22,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  cloudTwo: {
    position: 'absolute',
    top: 70,
    right: 12,
    width: 19,
    height: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },

  hangingLight: {
    position: 'absolute',
    top: 0,
    left: '48%',
    alignItems: 'center',
  },

  lightWire: {
    height: 30,
    width: 2,
    backgroundColor: '#B9AC9D',
  },

  lightShade: {
    width: 40,
    height: 21,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#E8C981',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  lightBulb: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: '#FFF4C9',
    marginBottom: -5,
  },

  shelf: {
    position: 'absolute',
    left: 28,
    bottom: 110,
    width: 104,
    height: 11,
    backgroundColor: '#BCA78E',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 9,
  },

  bookSelf: {
    width: 9,
    height: 30,
    backgroundColor: theme.colors.self,
    marginRight: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  bookMirror: {
    width: 9,
    height: 24,
    backgroundColor: theme.colors.mirror,
    marginRight: 3,
  },

  bookIdeal: {
    width: 8,
    height: 27,
    backgroundColor: theme.colors.ideal,
    marginRight: 11,
  },

  plantPot: {
    width: 22,
    height: 22,
    backgroundColor: '#B9C59F',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: 'relative',
  },

  plantLeafOne: {
    position: 'absolute',
    width: 12,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#91AA79',
    top: -16,
    left: 1,
    transform: [
      {
        rotate: '-25deg',
      },
    ],
  },

  plantLeafTwo: {
    position: 'absolute',
    width: 11,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#829E6D',
    top: -14,
    right: 0,
    transform: [
      {
        rotate: '28deg',
      },
    ],
  },

  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 125,
    backgroundColor: '#E6DAC8',
    borderTopWidth: 2,
    borderTopColor: '#D2C3AE',
  },

  rug: {
    position: 'absolute',
    bottom: 17,
    left: '19%',
    width: '62%',
    height: 56,
    borderRadius: 50,
    backgroundColor: '#D5C5B2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rugInner: {
    width: '82%',
    height: '60%',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E7DDD0',
  },

  characters: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 42,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  characterSlot: {
    width: '32%',
    alignItems: 'center',
  },

  characterPressable: {
    alignItems: 'center',
  },

  characterAnimated: {
    alignItems: 'center',
    position: 'relative',
  },

  characterType: {
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '900',
    color: theme.colors.muted,
    marginTop: -3,
  },

  characterName: {
    marginTop: 4,
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    minHeight: 30,
    paddingHorizontal: 2,
  },

  characterSubtitle: {
    marginTop: 1,
    fontSize: 8,
    color: theme.colors.muted,
    textAlign: 'center',
  },

  floorShadow: {
    position: 'absolute',
    bottom: 33,
    left: '10%',
    right: '10%',
    height: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(82,68,54,0.06)',
  },

  notice: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,

    shadowColor: '#2A2630',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 1,
  },

  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  noticeEyebrow: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  noticeTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 16,
  },

  noticeText: {
    color: theme.colors.muted,
    lineHeight: 20,
    fontSize: 13,
    marginTop: 8,
  },

  responseBadge: {
    minWidth: 48,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4E2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  responseBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.text,
  },

  progressTrack: {
    marginTop: 16,
    height: 8,
    backgroundColor: '#EEEAE4',
    borderRadius: 8,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.mirror,
    borderRadius: 8,
  },

  progressText: {
    marginTop: 9,
    fontSize: 11,
    color: theme.colors.muted,
  },

  completeIcon: {
    fontSize: 26,
    color: theme.colors.ideal,
  },

  actions: {
    marginTop: 18,
  },

  actionGap: {
    height: 10,
  },
});