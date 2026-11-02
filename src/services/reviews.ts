import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CustomerReview } from '../types';

const REVIEWS_COLLECTION = 'reviews';

export interface NewReviewInput {
  name: string;
  city?: string;
  rating: number;
  comment: string;
  productName?: string;
  photoUrl?: string;
  verifiedPurchase?: boolean;
}

/**
 * Fetch all community reviews from Firestore ordered by creation date descending
 */
export async function getCommunityReviews(): Promise<CustomerReview[]> {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const reviews: CustomerReview[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Calculate display date (e.g. 'Hoje', 'Há 1 dia', or formatted date)
      const dateStr = formatRelativeDate(data.createdAt);

      reviews.push({
        id: docSnap.id,
        name: data.name || 'Cliente Street Store',
        city: data.city || 'Brasil',
        rating: typeof data.rating === 'number' ? data.rating : 5,
        date: dateStr,
        comment: data.comment || '',
        productName: data.productName || 'Peça Street Store',
        verifiedPurchase: data.verifiedPurchase !== false,
        avatarText: data.avatarText || getAvatarInitials(data.name || 'CS'),
        photoUrl: data.photoUrl || undefined,
        createdAt: data.createdAt,
      });
    });

    return reviews;
  } catch (error) {
    // If collection is empty or index not ready, fallback gracefully
    console.warn('Could not fetch reviews from Firestore:', error);
    try {
      // Fallback simple fetch without order in case index is pending
      const fallbackSnapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
      const fallbackList: CustomerReview[] = [];
      fallbackSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fallbackList.push({
          id: docSnap.id,
          name: data.name || 'Cliente Street Store',
          city: data.city || 'Brasil',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          date: formatRelativeDate(data.createdAt),
          comment: data.comment || '',
          productName: data.productName || 'Peça Street Store',
          verifiedPurchase: data.verifiedPurchase !== false,
          avatarText: data.avatarText || getAvatarInitials(data.name || 'CS'),
          photoUrl: data.photoUrl || undefined,
          createdAt: data.createdAt,
        });
      });
      return fallbackList;
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.LIST, REVIEWS_COLLECTION);
    }
  }
}

/**
 * Add a new customer review to Firestore with data validation and sanitized fields
 */
export async function submitCommunityReview(input: NewReviewInput): Promise<CustomerReview> {
  const trimmedName = input.name.trim().slice(0, 60);
  const trimmedComment = input.comment.trim().slice(0, 1000);
  const trimmedCity = (input.city || 'Itabira - MG').trim().slice(0, 60);
  const trimmedProduct = (input.productName || 'Peça Street Store').trim().slice(0, 100);
  const rating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));
  const nowIso = new Date().toISOString();
  const avatarText = getAvatarInitials(trimmedName);

  const payload: Record<string, any> = {
    name: trimmedName,
    city: trimmedCity,
    rating,
    comment: trimmedComment,
    productName: trimmedProduct,
    verifiedPurchase: input.verifiedPurchase ?? true,
    avatarText,
    createdAt: nowIso,
  };

  // Only include photoUrl if valid and within 400KB
  if (input.photoUrl && input.photoUrl.length > 10 && input.photoUrl.length <= 400000) {
    payload.photoUrl = input.photoUrl;
  }

  try {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), payload);
    return {
      id: docRef.id,
      name: payload.name,
      city: payload.city,
      rating: payload.rating,
      date: 'Agora mesmo',
      comment: payload.comment,
      productName: payload.productName,
      verifiedPurchase: payload.verifiedPurchase,
      avatarText: payload.avatarText,
      photoUrl: payload.photoUrl,
      createdAt: payload.createdAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, REVIEWS_COLLECTION);
  }
}

/**
 * Helper to compute 2-letter uppercase initials
 */
export function getAvatarInitials(name: string): string {
  if (!name) return 'SS';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Helper to format ISO timestamp into relative or short readable string
 */
function formatRelativeDate(isoDate?: string): string {
  if (!isoDate) return 'Recentemente';
  try {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `Hoje (${diffHours}h atrás)`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return 'Recentemente';
  }
}

/**
 * Compress an image File from file input using an offscreen canvas
 * Returns a high quality, low footprint base64 data URL (< 150KB)
 */
export async function compressImageFile(file: File, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw and compress to image/jpeg
        ctx.fillStyle = '#0E0E0E';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
