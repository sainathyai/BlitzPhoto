/**
 * Photo List Component
 * 
 * Displays list of selected photos with previews.
 */

import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import PhotoPreview from './PhotoPreview';
import { theme } from '../../constants/theme';
import type { SelectedPhoto } from '../../hooks/usePhotoPicker';

interface PhotoListProps {
  photos: SelectedPhoto[];
  onRemove: (index: number) => void;
}

export default function PhotoList({ photos, onRemove }: PhotoListProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Selected Photos ({photos.length})
      </Text>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        renderItem={({ item, index }) => (
          <PhotoPreview photo={item} index={index} onRemove={onRemove} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});

