import { getAllReviewsForAdmin } from '@/lib/models/reviews';
import ReviewsManager from '@/components/admin/ReviewsManager';

export const metadata = { title: 'Admin — Reviews' };

export default function AdminReviewsPage() {
  const reviews = getAllReviewsForAdmin();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Reviews</h1>
      <ReviewsManager initialReviews={reviews} />
    </div>
  );
}
