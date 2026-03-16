/**
 * Google reviews integration
 * Reviews are fetched manually using: node scripts/fetch-reviews.js
 * and stored in src/data/reviews.json
 */

export interface ProcessedReview {
  name: string;
  profileUrl?: string;
  photoUrl?: string;
  rating: number;
  timeDescription: string;
  text: string;
  timestamp: number;
}

import reviewsData from '../data/reviews.json';

/**
 * Fetches reviews from the JSON file
 * To update reviews, run: node scripts/fetch-reviews.js
 */
export async function fetchGoogleReviews(): Promise<ProcessedReview[]> {
  try {
    const reviews = reviewsData as ProcessedReview[];
    return reviews;
  } catch {
    return [];
  }
}

/**
 * Get a random subset of reviews
 */
export function getRandomReviews(reviews: ProcessedReview[], count: number): ProcessedReview[] {
  const shuffled = [...reviews].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
