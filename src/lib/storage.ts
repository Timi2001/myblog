import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  progress: number;
  snapshot: UploadTaskSnapshot;
}

export interface ImageMetadata {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL: string;
}

// Image optimization function
export function optimizeImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  file: File, 
  path: string,
  onProgress?: (progress: UploadProgress) => void,
  optimize: boolean = true
): Promise<string> {
  try {
    let fileToUpload = file;
    
    // Optimize image if requested and it's an image
    if (optimize && file.type.startsWith('image/') && file.type !== 'image/gif') {
      try {
        fileToUpload = await optimizeImage(file);
      } catch (error) {
        console.warn('Image optimization failed, using original:', error);
        fileToUpload = file;
      }
    }
    
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress({ progress, snapshot });
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      return await getDownloadURL(snapshot.ref);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function listImages(folderPath: string): Promise<ImageMetadata[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const images: ImageMetadata[] = [];
    
    for (const itemRef of result.items) {
      try {
        const [metadata, downloadURL] = await Promise.all([
          getMetadata(itemRef),
          getDownloadURL(itemRef)
        ]);
        
        images.push({
          name: metadata.name,
          fullPath: metadata.fullPath,
          size: metadata.size,
          contentType: metadata.contentType || 'unknown',
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          downloadURL
        });
      } catch (error) {
        console.warn(`Failed to get metadata for ${itemRef.fullPath}:`, error);
      }
    }
    
    // Sort by creation time (newest first)
    return images.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}

export function getImagePath(type: 'articles' | 'branding' | 'media', filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${type}/${timestamp}_${sanitizedFilename}`;
}

export function extractPathFromURL(url: string): string | null {
  try {
    // Extract path from Firebase Storage URL
    const match = url.match(/\/o\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}