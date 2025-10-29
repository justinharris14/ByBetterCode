
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
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Media, Child } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MediaScreen() {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  
  // Upload form state
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [childPickerVisible, setChildPickerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load media
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          children:child_id (
            first_name,
            last_name
          )
        `)
        .order('uploaded_at', { ascending: false });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

      // Load children for dropdown
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('first_name');

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload media!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const uploadMedia = async () => {
    if (!selectedImage || !selectedChild) {
      Alert.alert('Error', 'Please select a child and media file');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to upload media');
      return;
    }

    setUploading(true);

    try {
      // Determine media type
      const isVideo = selectedImage.type === 'video';
      const mediaKind = isVideo ? 'video' : 'photo';
      
      // Get file extension
      const uriParts = selectedImage.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      // Create unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `${selectedChild}/${fileName}`;

      // Convert URI to blob for upload
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: selectedImage.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save media record to database
      const { error: dbError } = await supabase
        .from('media')
        .insert({
          child_id: selectedChild,
          uploaded_by: user.user_id,
          media_kind: mediaKind,
          media_url: urlData.publicUrl,
          caption: caption || null,
          consent_granted: consentGranted,
        });

      if (dbError) throw dbError;

      Alert.alert('Success', 'Media uploaded successfully!');
      
      // Reset form
      setModalVisible(false);
      setSelectedImage(null);
      setSelectedChild('');
      setCaption('');
      setConsentGranted(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaItem: Media) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract file path from URL
              const url = new URL(mediaItem.media_url);
              const pathParts = url.pathname.split('/media/');
              const filePath = pathParts[1];

              // Delete from storage
              const { error: storageError } = await supabase.storage
                .from('media')
                .remove([filePath]);

              if (storageError) throw storageError;

              // Delete from database
              const { error: dbError } = await supabase
                .from('media')
                .delete()
                .eq('media_id', mediaItem.media_id);

              if (dbError) throw dbError;

              Alert.alert('Success', 'Media deleted successfully');
              await loadData();
            } catch (error) {
              console.error('Error deleting media:', error);
              Alert.alert('Error', 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const viewMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setViewModalVisible(true);
  };

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.child_id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown';
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 10 }]}>Loading...</Text>
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
        <TouchableOpacity style={[buttonStyles.primary, styles.uploadButton]} onPress={pickImage}>
          <IconSymbol name="photo.badge.plus" size={20} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload Photo/Video</Text>
        </TouchableOpacity>

        {media.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="photo.on.rectangle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No media uploaded yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the button above to upload photos or videos
            </Text>
          </View>
        ) : (
          <View style={styles.mediaGrid}>
            {media.map((item) => (
              <TouchableOpacity
                key={item.media_id}
                style={styles.mediaCard}
                onPress={() => viewMedia(item)}
                onLongPress={() => deleteMedia(item)}
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
                  <Text style={styles.mediaChild}>
                    {getChildName(item.child_id)}
                  </Text>
                  <Text style={styles.mediaDate}>
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </Text>
                  {item.consent_granted && (
                    <View style={styles.consentBadge}>
                      <IconSymbol name="checkmark.circle.fill" size={12} color={colors.white} />
                      <Text style={styles.consentText}>Consent</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Media</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedImage && (
                <View style={styles.previewContainer}>
                  {selectedImage.type === 'video' ? (
                    <View style={styles.videoPreview}>
                      <IconSymbol name="play.circle.fill" size={64} color={colors.primary} />
                      <Text style={styles.videoText}>Video selected</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                  )}
                </View>
              )}

              <Text style={styles.label}>Select Child *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setChildPickerVisible(true)}
              >
                <Text style={selectedChild ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedChild ? getChildName(selectedChild) : 'Select a child'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a caption..."
                placeholderTextColor={colors.textSecondary}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setConsentGranted(!consentGranted)}
              >
                <View style={[styles.checkbox, consentGranted && styles.checkboxChecked]}>
                  {consentGranted && (
                    <IconSymbol name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Parent consent granted</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.submitButton, uploading && styles.buttonDisabled]}
                onPress={uploadMedia}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Child Picker Modal */}
      <Modal
        visible={childPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChildPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Child</Text>
              <TouchableOpacity onPress={() => setChildPickerVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.child_id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedChild(child.child_id);
                    setChildPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    {child.first_name} {child.last_name}
                  </Text>
                  {selectedChild === child.child_id && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                </View>
              )}
              
              <View style={styles.mediaDetails}>
                <Text style={styles.detailCaption}>{selectedMedia.caption || 'No caption'}</Text>
                <Text style={styles.detailInfo}>
                  Child: {getChildName(selectedMedia.child_id)}
                </Text>
                <Text style={styles.detailInfo}>
                  Uploaded: {new Date(selectedMedia.uploaded_at).toLocaleString()}
                </Text>
                {selectedMedia.consent_granted && (
                  <View style={styles.consentBadgeLarge}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color={colors.white} />
                    <Text style={styles.consentTextLarge}>Parent Consent Granted</Text>
                  </View>
                )}
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
  uploadButton: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  consentBadge: {
    marginTop: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  consentText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  previewContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.card,
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    marginTop: 10,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pickerModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
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
  consentBadgeLarge: {
    marginTop: 12,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  consentTextLarge: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
});
