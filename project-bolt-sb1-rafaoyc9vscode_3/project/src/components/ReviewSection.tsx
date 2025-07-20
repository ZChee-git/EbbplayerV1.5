import React from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { VideoCard } from './VideoCard';
import { VideoFile, ReviewSchedule } from '../types';

interface ReviewSectionProps {
  todayReviews: ReviewSchedule[];
  videos: VideoFile[];
  onCompleteReview: (videoId: string) => void;
  onStartLearning: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  todayReviews,
  videos,
  onCompleteReview,
  onStartLearning,
  onDelete,
}) => {
  const reviewVideos = todayReviews.map(review => 
    videos.find(video => video.id === review.videoId)
  ).filter(Boolean) as VideoFile[];

  if (todayReviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Calendar className="mr-3 text-green-600" size={28} />
          Today's Reviews
        </h2>
        
        <div className="text-center py-8">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <p className="text-xl text-gray-600 mb-2">Great job! No reviews due today.</p>
          <p className="text-gray-500">Take a break or add new videos to continue learning.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-3 text-red-600" size={28} />
        Today's Reviews
        <span className="ml-3 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
          {todayReviews.length} due
        </span>
      </h2>

      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
        <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
        <div>
          <p className="text-red-800 font-medium">
            You have {todayReviews.length} video(s) scheduled for review today.
          </p>
          <p className="text-red-600 text-sm mt-1">
            Complete these reviews to maintain your learning progress according to the Ebbinghaus forgetting curve.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviewVideos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            onStartLearning={onStartLearning}
            onCompleteReview={onCompleteReview}
            onDelete={onDelete}
            isReviewDue={true}
          />
        ))}
      </div>
    </div>
  );
};