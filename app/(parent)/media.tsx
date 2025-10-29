
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
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Media, Child } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ParentMediaScreen() {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load parent's children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('first_name');

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Get child IDs
      const childIds = childrenData?.map((c) => c.child_id) || [];

      if (childIds.length === 0) {
        setMedia([]);
        setLoading(false);
        return;
      }

      // Load media for parent's children
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          children:child_id (
            first_name,
            last_name
          )
        `)
        .in('child_id', childIds)
        .order('uploaded_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const viewMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setViewModalVisible(true);
  };

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.child_id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown';
  };

  const getFilteredMedia = () => {
    if (selectedFilter === 'all') {
      return media;
    }
    return media.filter((m) => m.child_id === selectedFilter);
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 10 }]}>Loading...</Text>
      </View>
    );
  }

  const filteredMedia = getFilteredMedia();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter by child */}
        {children.length > 1 && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All Children
                </Text>
              </TouchableOpacity>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.child_id}
                  style={[
                    styles.filterButton,
                    selectedFilter === child.child_id && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(child.child_id)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === child.child_id && styles.filterButtonTextActive,
                    ]}
                  >
                    {child.first_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="photo" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>
              {filteredMedia.filter((m) => m.media_kind === 'photo').length}
            </Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="video.fill" size={24} color={colors.secondary} />
            <Text style={styles.statNumber}>
              {filteredMedia.filter((m) => m.media_kind === 'video').length}
            </Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="calendar" size={24} color={colors.accent} />
            <Text style={styles.statNumber}>{filteredMedia.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {filteredMedia.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="photo.on.rectangle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No media available</Text>
            <Text style={styles.emptySubtext}>
              Photos and videos will appear here when teachers upload them
            </Text>
          </View>
        ) : (
          <View style={styles.mediaGrid}>
            {filteredMedia.map((item) => (
              <TouchableOpacity
                key={item.media_id}
                style={styles.mediaCard}
                onPress={() => viewMedia(item)}
              >
                {item.media_kind === 'photo' ? (
                  <Image source={{ uri: item.media_url }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <IconSymbol name="play.circle.fill" size={48} color={colors.white} />
                  </View>
                )}

                <View style={styles.mediaInfo}>
                  <Text style={styles.mediaCaption} numberOfLines={2}>
                    {item.caption || 'No caption'}
                  </Text>
                  {children.length > 1 && (
                    <Text style={styles.mediaChild}>{getChildName(item.child_id)}</Text>
                  )}
                  <Text style={styles.mediaDate}>
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* View Media Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.viewModalOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setViewModalVisible(false)}
          >
            <IconSymbol name="xmark.circle.fill" size={36} color={colors.white} />
          </TouchableOpacity>

          {selectedMedia && (
            <View style={styles.viewModalContent}>
              {selectedMedia.media_kind === 'photo' ? (
                <Image
                  source={{ uri: selectedMedia.media_url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.videoFullPlaceholder}>
                  <IconSymbol name="play.circle.fill" size={80} color={colors.white} />
                  <Text style={styles.videoFullText}>
                    Video playback not available in preview
                  </Text>
                  <Text style={styles.videoFullSubtext}>
                    Open in browser to view video
                  </Text>
                </View>
              )}

              <View style={styles.mediaDetails}>
                <Text style={styles.detailCaption}>
                  {selectedMedia.caption || 'No caption'}
                </Text>
                <Text style={styles.detailInfo}>
                  Child: {getChildName(selectedMedia.child_id)}
                </Text>
                <Text style={styles.detailInfo}>
                  Uploaded: {new Date(selectedMedia.uploaded_at).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.card,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    padding: 12,
  },
  mediaCaption: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  mediaChild: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 2,
  },
  mediaDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  viewModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: width,
  },
  videoFullPlaceholder: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoFullText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  videoFullSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mediaDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  detailCaption: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  detailInfo: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
});
