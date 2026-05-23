import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useAppAnimations(photoUri: string | null, loading: boolean) {
  const resultAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const loadingPulse = useRef(new Animated.Value(1)).current;
  const photoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (photoUri) {
      photoAnim.setValue(0);
      Animated.spring(photoAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [photoUri]);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(loadingPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      loadingPulse.stopAnimation();
      loadingPulse.setValue(1);
    }
  }, [loading]);

  const onAnalyzePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const onAnalyzePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const resultAnimatedStyle = {
    opacity: resultAnim,
    transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  const photoAnimatedStyle = {
    opacity: photoAnim,
    transform: [{ scale: photoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };

  const analyzeButtonAnimatedStyle = {
    transform: [{ scale: buttonScale }],
    opacity: loadingPulse,
  };

  const resetAnimations = () => {
    resultAnim.setValue(0);
    photoAnim.setValue(0);
  };

  const animateResultEntrance = () => {
    Animated.timing(resultAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  return {
    onAnalyzePressIn,
    onAnalyzePressOut,
    resultAnimatedStyle,
    photoAnimatedStyle,
    analyzeButtonAnimatedStyle,
    resetAnimations,
    animateResultEntrance,
  };
}
