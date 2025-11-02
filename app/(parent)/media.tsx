
import React, { useEffect, useState, useCallback } from 'react';
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
  Platform,
  TextInput,
  Switch,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Media, Child, MediaConsent, ConsentType, UsagePermission } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

export default function ParentMediaScreen() {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [consents, setConsents] = useState<Record<string, MediaConsent>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [downloading, setDownloading] = useState(false);
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedChildForConsent, setSelectedChildForConsent] = useState<Child | null>(null);

  const loadData = useCallback(async () => {
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

      // Load existing consents
      const { data: consentsData, error: consentsError } = await supabase
        .from('media_consent')
        .select('*')
        .eq('parent_id', user.user_id);

      if (consentsError) throw consentsError;

      const consentsMap: Record<string, MediaConsent> = {};
      (consentsData || []).forEach((consent) => {
        consentsMap[consent.child_id] = consent;
      });
      setConsents(consentsMap);

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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const viewMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setViewModalVisible(true);
  };

  const downloadMedia = async (mediaItem: Media) => {
    try {
      // Check and request permissions
      if (!mediaLibraryPermission || mediaLibraryPermission.status !== 'granted') {
        const { status } = await requestMediaLibraryPermission();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need permission to save media to your device. Please enable it in your device settings.'
          );
          return;
        }
      }

      setDownloading(true);

      // Get file extension from URL
      const urlParts = mediaItem.media_url.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params if any
      
      // Create a unique filename
      const childName = getChildName(mediaItem.child_id).replace(/\s+/g, '_');
      const timestamp = new Date(mediaItem.uploaded_at).getTime();
      const fileName = `CrecheConnect_${childName}_${timestamp}.${extension}`;

      // Download the file using the new API
      console.log('Downloading from:', mediaItem.media_url);

      const downloadedFile = await File.downloadFileAsync(
        mediaItem.media_url,
        Paths.cache
      );

      console.log('Download complete:', downloadedFile.uri);

      // Save to media library
      const asset = await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);
      console.log('Saved to library:', asset);

      Alert.alert(
        'Success',
        `${mediaItem.media_kind === 'photo' ? 'Photo' : 'Video'} saved to your device!`,
        [{ text: 'OK' }]
      );

      // Clean up the temporary file
      try {
        downloadedFile.delete();
      } catch (cleanupError) {
        console.log('Cleanup error (non-critical):', cleanupError);
      }
    } catch (error) {
      console.error('Error downloading media:', error);
      Alert.alert(
        'Download Failed',
        'Unable to download the media. Please check your internet connection and try again.'
      );
    } finally {
      setDownloading(false);
    }
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

  const getConsentStatus = (childId: string) => {
    const consent = consents[childId];
    if (!consent) return { status: 'Not Submitted', color: colors.textSecondary, icon: 'exclamationmark.circle' };
    if (consent.consent_granted) return { status: 'Consent Granted', color: '#4CAF50', icon: 'checkmark.circle.fill' };
    return { status: 'Consent Denied', color: colors.accent, icon: 'xmark.circle.fill' };
  };

  const openConsentForm = (child: Child) => {
    setSelectedChildForConsent(child);
    setShowConsentModal(true);
  };

  const closeConsentModal = () => {
    setShowConsentModal(false);
    setSelectedChildForConsent(null);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gallery & Consent</Text>
          <Text style={styles.subtitle}>
            View photos, videos, and manage media permissions
          </Text>
        </View>

        {/* Consent Forms Section */}
        <View style={styles.consentSection}>
          <Text style={styles.sectionTitle}>📝 Media Consent Forms</Text>
          {children.length === 0 ? (
            <View style={styles.emptyConsentState}>
              <Text style={styles.emptyConsentText}>No children registered</Text>
            </View>
          ) : (
            children.map((child) => {
              const consentStatus = getConsentStatus(child.child_id);
              return (
                <TouchableOpacity
                  key={child.child_id}
                  style={styles.consentCard}
                  onPress={() => openConsentForm(child)}
                >
                  <View style={styles.consentCardContent}>
                    <View style={styles.consentInfo}>
                      <Text style={styles.consentChildName}>
                        {child.first_name} {child.last_name}
                      </Text>
                      <View style={styles.consentStatusRow}>
                        <IconSymbol name={consentStatus.icon as any} size={16} color={consentStatus.color} />
                        <Text style={[styles.consentStatusText, { color: consentStatus.color }]}>
                          {consentStatus.status}
                        </Text>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

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
            <>
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
                      Download to view on your device
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

              {/* Download Button */}
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadMedia(selectedMedia)}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <IconSymbol name="arrow.down.circle.fill" size={24} color={colors.white} />
                    <Text style={styles.downloadButtonText}>
                      Download {selectedMedia.media_kind === 'photo' ? 'Photo' : 'Video'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Consent Form Modal */}
      <Modal
        visible={showConsentModal}
        animationType="slide"
        transparent={false}
        onRequestClose={closeConsentModal}
      >
        <View style={commonStyles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeConsentModal} style={styles.modalCloseButton}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Media Consent Form</Text>
            <View style={{ width: 24 }} />
          </View>
          {selectedChildForConsent && (
            <ConsentForm
              child={selectedChildForConsent}
              existingConsent={consents[selectedChildForConsent.child_id]}
              onSave={() => {
                loadData();
                closeConsentModal();
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

interface ConsentFormProps {
  child: Child;
  existingConsent?: MediaConsent;
  onSave: () => void;
}

function ConsentForm({ child, existingConsent, onSave }: ConsentFormProps) {
  const { user } = useAuth();
  const [consentGranted, setConsentGranted] = useState(existingConsent?.consent_granted || false);
  const [consentType, setConsentType] = useState<ConsentType>(existingConsent?.consent_type || 'both');
  const [usagePermissions, setUsagePermissions] = useState<UsagePermission[]>(
    existingConsent?.usage_permissions || []
  );
  const [specialConditions, setSpecialConditions] = useState(existingConsent?.special_conditions || '');
  const [signatureName, setSignatureName] = useState(existingConsent?.signature_data || '');
  const [saving, setSaving] = useState(false);

  const toggleUsagePermission = (permission: UsagePermission) => {
    if (usagePermissions.includes(permission)) {
      setUsagePermissions(usagePermissions.filter((p) => p !== permission));
    } else {
      setUsagePermissions([...usagePermissions, permission]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (consentGranted && !signatureName.trim()) {
      Alert.alert('Required', 'Please enter your full name as a digital signature');
      return;
    }

    if (consentGranted && usagePermissions.length === 0) {
      Alert.alert('Required', 'Please select at least one usage permission');
      return;
    }

    setSaving(true);
    try {
      const consentData = {
        child_id: child.child_id,
        parent_id: user.user_id,
        consent_granted: consentGranted,
        consent_date: new Date().toISOString(),
        consent_type: consentType,
        usage_permissions: consentGranted ? usagePermissions : [],
        special_conditions: specialConditions.trim() || null,
        signature_data: signatureName.trim(),
      };

      if (existingConsent) {
        const { error } = await supabase
          .from('media_consent')
          .update(consentData)
          .eq('consent_id', existingConsent.consent_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('media_consent')
          .insert([consentData]);

        if (error) throw error;
      }

      Alert.alert('Success', 'Consent form saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save consent form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formContent}>
      <View style={styles.formHeader}>
        <Text style={styles.formChildName}>
          {child.first_name} {child.last_name}
        </Text>
        <Text style={styles.formSubtitle}>
          Manage photo and video permissions
        </Text>
      </View>

      {/* Consent Toggle */}
      <View style={styles.formSection}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.formLabel}>Grant Media Consent</Text>
            <Text style={styles.formHint}>
              Allow photos/videos of {child.first_name} to be taken
            </Text>
          </View>
          <Switch
            value={consentGranted}
            onValueChange={setConsentGranted}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {consentGranted && (
        <>
          {/* Media Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Media Type</Text>
            <View style={styles.optionsGrid}>
              {(['photos', 'videos', 'both'] as ConsentType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    consentType === type && styles.optionButtonActive,
                  ]}
                  onPress={() => setConsentType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      consentType === type && styles.optionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Usage Permissions */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Usage Permissions *</Text>
            <Text style={styles.formHint}>Select where media can be used</Text>
            
            {[
              { value: 'internal' as UsagePermission, label: 'Internal Use Only', desc: 'Shared only with parents via app' },
              { value: 'website' as UsagePermission, label: 'School Website', desc: 'Featured on CrècheConnect website' },
              { value: 'social_media' as UsagePermission, label: 'Social Media', desc: 'Posted on school social media' },
              { value: 'promotional' as UsagePermission, label: 'Promotional Materials', desc: 'Used in brochures, flyers, etc.' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.checkboxRow}
                onPress={() => toggleUsagePermission(option.value)}
              >
                <View style={styles.checkbox}>
                  {usagePermissions.includes(option.value) && (
                    <IconSymbol name="checkmark" size={16} color={colors.primary} />
                  )}
                </View>
                <View style={styles.checkboxLabel}>
                  <Text style={styles.checkboxText}>{option.label}</Text>
                  <Text style={styles.checkboxDesc}>{option.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Conditions */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Special Conditions (Optional)</Text>
            <Text style={styles.formHint}>
              Any specific restrictions or requirements
            </Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="E.g., No close-up photos, only group photos, etc."
              placeholderTextColor={colors.textSecondary}
              value={specialConditions}
              onChangeText={setSpecialConditions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Digital Signature */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Digital Signature *</Text>
            <Text style={styles.formHint}>Enter your full name to sign</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={signatureName}
              onChangeText={setSignatureName}
            />
          </View>
        </>
      )}

      {!consentGranted && (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Digital Signature *</Text>
          <Text style={styles.formHint}>Enter your full name to confirm denial</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.textSecondary}
            value={signatureName}
            onChangeText={setSignatureName}
          />
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[buttonStyles.primary, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : existingConsent ? 'Update Consent' : 'Submit Consent'}
        </Text>
      </TouchableOpacity>

      {/* Legal Notice */}
      <View style={styles.legalNotice}>
        <Text style={styles.legalText}>
          By submitting this form, you acknowledge that you have read and understood the media consent policy. 
          You may update or revoke consent at any time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  consentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyConsentState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyConsentText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  consentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consentInfo: {
    flex: 1,
  },
  consentChildName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  consentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consentStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    bottom: 100,
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
  downloadButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  formScrollView: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formHeader: {
    marginBottom: 24,
  },
  formChildName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  formHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  checkboxDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  legalNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  legalText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
