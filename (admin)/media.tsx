
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Media } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function MediaScreen() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
      Alert.alert('Error', 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    setRefreshing(false);
  };

  const handleUpload = () => {
    Alert.alert('Upload Media', 'Media upload functionality requires Supabase Storage setup');
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity style={[buttonStyles.primary, styles.uploadButton]} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>+ Upload Media</Text>
        </TouchableOpacity>

        {media.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No media uploaded yet</Text>
          </View>
        ) : (
          <View style={styles.mediaGrid}>
            {media.map((item) => (
              <View key={item.media_id} style={styles.mediaCard}>
                <View style={styles.mediaPlaceholder}>
                  <IconSymbol
                    name={item.media_kind === 'photo' ? 'photo' : 'videocam'}
                    size={48}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={styles.mediaCaption} numberOfLines={2}>
                  {item.caption || 'No caption'}
                </Text>
                <Text style={styles.mediaDate}>
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </Text>
                {item.consent_granted && (
                  <View style={styles.consentBadge}>
                    <Text style={styles.consentText}>✓ Consent</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  uploadButton: {
    marginBottom: 20,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaCaption: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  mediaDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  consentBadge: {
    marginTop: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  consentText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
});
