import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FOOD_IMAGES, FALLBACK_IMAGE } from '../data/foodImages';

// Reusable dish photo. size: 'thumb' (56x56) or 'card'/'hero' (fills caller box).
// Caller controls dimensions, radius and overflow via `style`.
export default function FoodImage({ dish, size = 'card', style, shade = false }) {
  const entry = (dish && FOOD_IMAGES[dish]) || FALLBACK_IMAGE;
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const src = failed ? FALLBACK_IMAGE.image : size === 'thumb' ? entry.thumb : entry.image;
  return (
    <View
      style={[styles.base, size === 'thumb' && styles.thumb, style]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F1E9E2' }]} />
      <View style={[StyleSheet.absoluteFill, { transform: [{ scale: hovered ? 1.04 : 1 }] }]}>
        <Image
          source={src}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          onError={() => setFailed(true)}
          accessibilityLabel={entry.alt}
        />
      </View>
      {shade && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: '#F1E9E2' },
  thumb: { width: 56, height: 56, borderRadius: 12 },
});
