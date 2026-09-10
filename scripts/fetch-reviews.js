#!/usr/bin/env node

/**
 * Fetch Google reviews from DataForSEO and save to src/data/reviews.json.
 * This is the canonical review pipeline for orbiter sites.
 *
 * Setup:
 *   1. Sign up at https://dataforseo.com
 *   2. Add DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, and GOOGLE_PLACE_ID to .env
 *      (Place ID: https://developers.google.com/maps/documentation/places/web-service/place-id)
 *
 * Runs automatically before every build (npm run build → prebuild), and can be
 * run manually with `npm run fetch-reviews`. It is build-safe: if credentials or
 * the Place ID are missing, or the fetch fails, it warns and leaves the existing
 * committed reviews.json untouched rather than failing the build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

async function createReviewTask() {
  const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/business_data/google/reviews/task_post', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      place_id: PLACE_ID,
      language_name: 'English',
      depth: 100,
      sort_by: 'newest',
    }]),
  });

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO task creation failed: ${data.status_code}`);
  }

  return data.tasks?.[0]?.id || null;
}

async function getTaskResults(taskId) {
  const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

  const response = await fetch(`https://api.dataforseo.com/v3/business_data/google/reviews/task_get/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO task retrieval failed: ${data.status_code}`);
  }

  return data.tasks?.[0]?.result?.[0]?.items || [];
}

async function pollForResults(taskId, maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const reviews = await getTaskResults(taskId);
      if (reviews.length > 0) {
        console.log(`Task completed after ${attempt + 1} attempts (~${(attempt + 1) * 2}s)`);
        return reviews;
      }
    } catch (error) {
      if (attempt % 5 === 0 && attempt > 0) {
        console.log(`Still polling... (attempt ${attempt + 1}/${maxAttempts})`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Task polling timeout');
}

async function main() {
  if (!PLACE_ID || !DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.warn(
      '⚠ Skipping review fetch: set GOOGLE_PLACE_ID, DATAFORSEO_LOGIN, and ' +
      'DATAFORSEO_PASSWORD in .env to enable. Keeping existing reviews.json.'
    );
    return;
  }

  console.log('Creating DataForSEO task to fetch reviews...');
  const taskId = await createReviewTask();

  if (!taskId) {
    console.error('Failed to create task');
    process.exit(1);
  }

  console.log(`Task created: ${taskId}`);
  console.log('Polling for results (this may take 30-60 seconds)...');

  const reviews = await pollForResults(taskId);

  console.log(`Fetched ${reviews.length} total reviews from DataForSEO`);

  const processedReviews = reviews
    .filter(review => {
      if (review.rating?.value !== 5) return false;
      if (!review.review_text || review.review_text.trim() === '') return false;
      if (!review.profile_name || review.profile_name.trim() === '') return false;
      return true;
    })
    .map(review => {
      let timestamp = Date.now();
      if (review.timestamp) {
        const date = new Date(review.timestamp);
        timestamp = date.getTime();
      }

      return {
        name: review.profile_name,
        profileUrl: review.profile_url,
        photoUrl: review.profile_image_url,
        rating: review.rating.value,
        timeDescription: review.time_ago || 'recently',
        text: review.review_text,
        timestamp,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 30);

  console.log(`Filtered to ${processedReviews.length} 5-star reviews with text`);

  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'reviews.json');
  fs.writeFileSync(outputPath, JSON.stringify(processedReviews, null, 2));

  console.log(`Reviews saved to src/data/reviews.json`);
}

main().catch(error => {
  // Build-safe: never fail the build over a review-fetch error. The committed
  // reviews.json is kept as a fallback.
  console.warn(`⚠ Review fetch failed (keeping existing reviews.json): ${error.message}`);
});
