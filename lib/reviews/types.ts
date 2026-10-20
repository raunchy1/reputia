import { UserError } from "@/lib/errors";

export type ProviderLocation = { externalId: string; name: string; address?: string };

export type ProviderReview = {
  externalId: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  comment?: string;
  reviewedAt: Date;
  reply?: { text: string; updatedAt: Date };
};

export type ReviewPage = { reviews: ProviderReview[]; nextPageToken?: string };

export interface ReviewProvider {
  readonly kind: "GOOGLE" | "MOCK";
  listLocations(): Promise<ProviderLocation[]>;
  listReviews(locationExternalId: string, pageToken?: string): Promise<ReviewPage>;
  /** Creates or replaces the public reply. */
  publishReply(locationExternalId: string, reviewExternalId: string, text: string): Promise<void>;
  deleteReply(locationExternalId: string, reviewExternalId: string): Promise<void>;
}

export class ProviderAuthError extends UserError {}
export class ProviderError extends Error {}
