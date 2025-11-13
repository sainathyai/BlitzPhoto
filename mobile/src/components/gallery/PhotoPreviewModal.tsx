/**
 * Photo Preview Modal
 * 
 * Full-screen photo preview modal with slideshow navigation for mobile.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PhotoStatusResponse } from '../../types/api.types';
import { theme } from '../../constants/theme';

interface PhotoPreviewModalProps {
  visible: boolean;
  photos: PhotoStatusResponse[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoPreviewModal({
  visible,
  photos,
  initialIndex,
  onClose,
}: PhotoPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setImageLoading(true);
    }
  }, [visible, initialIndex]);

  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? photos.length - 1 : newIndex;
    });
    setImageLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= photos.length ? 0 : newIndex;
    });
    setImageLoading(true);
  };

  if (!visible || photos.length === 0 || !currentPhoto) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {currentIndex + 1} / {photos.length}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image Container */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
              setImageLoading(true);
            }
          }}
          contentOffset={{ x: currentIndex * SCREEN_WIDTH, y: 0 }}
        >
          {photos.map((photo, index) => (
            <View key={photo.photoId} style={styles.imageContainer}>
              {photo.photoUrl ? (
                <>
                  {imageLoading && index === currentIndex && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                  )}
                  <Image
                    source={{ uri: photo.photoUrl }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoad={() => {
                      if (index === currentIndex) {
                        setImageLoading(false);
                      }
                    }}
                    onError={() => {
                      if (index === currentIndex) {
                        setImageLoading(false);
                      }
                    }}
                  />
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={64} color={theme.colors.textSecondary} />
                  <Text style={styles.placeholderText}>Photo not available</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <Ionicons name="chevron-back" size={32} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Ionicons name="chevron-forward" size={32} color={theme.colors.text} />
            </TouchableOpacity>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>
            {currentPhoto.fileName}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    transform: [{ translateY: -20 }],
  },
  prevButton: {
    left: theme.spacing.md,
  },
  nextButton: {
    right: theme.spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

