import React from 'react';
import { Play, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoCardProps {
  video: VideoFile;
  onStartLearning: (videoId: string) => void;
  onCompleteReview: (videoId: string) => void;
  onDelete: (videoId: string) => void;
  isReviewDue?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onStartLearning,
  onCompleteReview,
  onDelete,
  isReviewDue = false,
}) => {
  const getStatusColor = (status: VideoFile['status']) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-700';
      case 'learning': return 'bg-blue-100 text-blue-700';
      case 'reviewing': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: VideoFile['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'learning': return 'Learning';
      case 'reviewing': return 'Reviewing';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const getNextReviewDate = () => {
    if (video.status === 'learning' || video.status === 'reviewing') {
      const nextDate = video.reviewDates[video.currentReviewIndex];
      return nextDate ? new Date(nextDate).toLocaleDateString() : 'N/A';
    }
    return 'N/A';
  };

  const formatProgress = () => {
    if (video.status === 'completed') return '4/4';
    if (video.status === 'new') return '0/4';
    return `${video.completedReviews.length}/4`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all hover:shadow-xl ${
      isReviewDue ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-4">
          {video.name}
        </h3>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(video.status)}`}>
            {getStatusText(video.status)}
          </span>
          <button
            onClick={() => onDelete(video.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
            title="Delete video"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 text-blue-500" />
          <span>Added: {new Date(video.dateAdded).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <Clock size={16} className="mr-2 text-green-500" />
          <span>Progress: {formatProgress()}</span>
        </div>
      </div>

      {(video.status === 'learning' || video.status === 'reviewing') && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Next Review:</strong> {getNextReviewDate()}
          </p>
          {isReviewDue && (
            <p className="text-sm text-red-600 font-medium mt-1">
              📅 Review due today!
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        {video.status === 'new' && (
          <button
            onClick={() => onStartLearning(video.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
          >
            <Play size={16} className="mr-2" />
            Start Learning
          </button>
        )}

        {(video.status === 'learning' || video.status === 'reviewing') && isReviewDue && (
          <button
            onClick={() => onCompleteReview(video.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
          >
            <CheckCircle size={16} className="mr-2" />
            Complete Review
          </button>
        )}

        {video.status === 'completed' && (
          <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center">
            <CheckCircle size={16} className="mr-2" />
            All Reviews Complete
          </div>
        )}
      </div>
    </div>
  );
};