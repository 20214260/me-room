import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/src/constants/theme';
import { PersonaType } from '@/src/types/persona';

const config = {
  SELF: {
    color: theme.colors.self,
    cheek: '#B8B2F2',
  },
  MIRROR: {
    color: theme.colors.mirror,
    cheek: '#F1C1D2',
  },
  IDEAL: {
    color: theme.colors.ideal,
    cheek: '#F4CA7A',
  },
};

export function PersonaAvatar({
  type,
  locked = false,
  size = 96,
}: {
  type: PersonaType;
  locked?: boolean;
  size?: number;
}) {
  const c = config[type];

  const headSize = size * 0.42;
  const bodyWidth = size * 0.62;
  const bodyHeight = size * 0.44;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size + 24,
        },
        locked && styles.locked,
      ]}
    >
      <View
        style={[
          styles.head,
          {
            width: headSize,
            height: headSize,
            borderRadius: headSize / 2,
            backgroundColor: c.color,
          },
        ]}
      >
        {locked ? (
          <Text
            style={[
              styles.question,
              {
                fontSize: size * 0.2,
              },
            ]}
          >
            ?
          </Text>
        ) : (
          <>
            <View style={styles.face}>
              <View style={styles.eye}>
                <View style={styles.pupil} />
              </View>

              <View style={styles.eye}>
                <View style={styles.pupil} />
              </View>
            </View>

            <View style={styles.cheeks}>
              <View
                style={[
                  styles.cheek,
                  {
                    backgroundColor: c.cheek,
                  },
                ]}
              />

              <View
                style={[
                  styles.cheek,
                  {
                    backgroundColor: c.cheek,
                  },
                ]}
              />
            </View>

            <View style={styles.mouth} />

            {type === 'IDEAL' && (
              <Text style={styles.sparkle}>
                ✦
              </Text>
            )}
          </>
        )}
      </View>

      <View
        style={[
          styles.body,
          {
            width: bodyWidth,
            height: bodyHeight,
            borderRadius: size * 0.22,
            backgroundColor: c.color,
          },
        ]}
      >
        <View
          style={[
            styles.arm,
            styles.armLeft,
            {
              backgroundColor: c.color,
            },
          ]}
        />

        <View
          style={[
            styles.arm,
            styles.armRight,
            {
              backgroundColor: c.color,
            },
          ]}
        />
      </View>

      {locked && (
        <Text style={styles.lock}>
          LOCKED
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  head: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    marginBottom: -4,
    position: 'relative',
  },

  body: {
    opacity: 0.96,
    zIndex: 2,
    position: 'relative',
  },

  face: {
    position: 'absolute',
    top: '35%',
    left: '22%',
    right: '22%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  eye: {
    width: 8,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pupil: {
    width: 3,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#393743',
  },

  cheeks: {
    position: 'absolute',
    top: '58%',
    left: '12%',
    right: '12%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cheek: {
    width: 7,
    height: 4,
    borderRadius: 5,
    opacity: 0.8,
  },

  mouth: {
    position: 'absolute',
    bottom: '22%',
    width: 9,
    height: 5,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },

  sparkle: {
    position: 'absolute',
    top: -9,
    right: -6,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  question: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  arm: {
    position: 'absolute',
    width: 16,
    height: 34,
    borderRadius: 12,
    top: 8,
  },

  armLeft: {
    left: -5,
    transform: [{ rotate: '12deg' }],
  },

  armRight: {
    right: -5,
    transform: [{ rotate: '-12deg' }],
  },

  locked: {
    opacity: 0.42,
  },

  lock: {
    marginTop: 4,
    fontSize: 9,
    letterSpacing: 1.4,
    color: theme.colors.muted,
    fontWeight: '800',
  },
});