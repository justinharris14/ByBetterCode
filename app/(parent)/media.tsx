
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Media, Child } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ParentMediaScreen() {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [user]);

  const loadMedia = async () => {
    if (!user) return;

    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('child_id')
        .eq('parent_id', user.user_id);

      if (childrenError) throw childrenError;

      const childIds = childrenData?.map(c => c.child_id) || [];

      if (childIds.length === 0) {
        setMedia([]);
        setLoading(false);
        return;
      }

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .in('child_id', childIds)
        .eq('consent_granted', true)
        .order('uploaded_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);
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
        {media.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No media available</Text>
          </View>
        ) : (
          <View style={styles.mediaGrid}>
            {media.map((item) => (
              <View key={item.media_id} style={styles.mediaCard}>
                <View style={styles.mediaPlaceholder}>
                  <IconSymbol
                    name={item.media_kind === 'photo' ? 'photo' : 'video.fill'}
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
});
