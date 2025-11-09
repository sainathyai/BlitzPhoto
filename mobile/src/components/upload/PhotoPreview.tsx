/**
 * Photo Preview Component
 * 
 * Displays selected photo with thumbnail and remove option.
 */

import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatFileSize } from '../../utils/format';
import type { SelectedPhoto } from '../../hooks/usePhotoPicker';

interface PhotoPreviewProps {
  photo: SelectedPhoto;
  index: number;
  onRemove: (index: number) => void;
}

export default function PhotoPreview({ photo, index, onRemove }: PhotoPreviewProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {photo.name}
        </Text>
        <Text style={styles.size}>{formatFileSize(photo.size)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(index)}
      >
        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  size: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
});

