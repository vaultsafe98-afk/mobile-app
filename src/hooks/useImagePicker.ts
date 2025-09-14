import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { imagekitService } from '../services/imagekitService';
import { useAppDispatch, useAppSelector } from './redux';
import { addNotification } from '../store/slices/notificationSlice';

interface ImagePickerOptions {
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface UseImagePickerReturn {
  selectedImage: string | null;
  isUploading: boolean;
  uploadProgress: number;
  pickImage: () => void;
  takePhoto: () => void;
  uploadImage: (userId: string) => Promise<string | null>;
  clearImage: () => void;
}

export const useImagePicker = (options: ImagePickerOptions = {}): UseImagePickerReturn => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const defaultOptions: ImagePickerOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
    ...options,
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      }
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        setSelectedImage(asset.uri);
      }
    }
  };

  const pickImage = () => {
    const imageOptions = {
      mediaType: defaultOptions.mediaType,
      quality: defaultOptions.quality,
      maxWidth: defaultOptions.maxWidth,
      maxHeight: defaultOptions.maxHeight,
    };

    launchImageLibrary(imageOptions, handleImageResponse);
  };

  const takePhoto = () => {
    const imageOptions = {
      mediaType: defaultOptions.mediaType,
      quality: defaultOptions.quality,
      maxWidth: defaultOptions.maxWidth,
      maxHeight: defaultOptions.maxHeight,
    };

    launchCamera(imageOptions, handleImageResponse);
  };

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!selectedImage) {
      Alert.alert('Error', 'No image selected');
      return null;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileName = imagekitService.generateFileName(userId, 'deposit_proof.jpg');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to ImageKit
      const imageUrl = await imagekitService.uploadImage(selectedImage, fileName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add success notification
      dispatch(addNotification({
        message: 'Your deposit proof has been uploaded successfully!',
        type: 'deposit',
      }));

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setUploadProgress(0);
  };

  return {
    selectedImage,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    uploadImage,
    clearImage,
  };
};
