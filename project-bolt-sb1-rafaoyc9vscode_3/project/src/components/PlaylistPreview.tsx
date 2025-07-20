import React from 'react';
import { Play, Headphones, Video, Calendar, Plus, Lightbulb } from 'lucide-react';
import { PlaylistPreview as PlaylistPreviewType, VideoFile } from '../types';

type PreviewType = 'new' | 'review';
interface PlaylistPreviewProps {
  preview: PlaylistPreviewType;
  videos: VideoFile[];
  onStartPlaylist: () => void;
  previewType: PreviewType;
}

export const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({
  preview,
  videos,
  onStartPlaylist,
  previewType,
}) => {
  const getVideoName = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    return video?.name || 'Unknown Video';
  };

  const getReviewPrompt = (item: any) => {
    if (item.isRecommendedForVideo && item.daysSinceFirstPlay) {
      const intervalText = item.reviewNumber === 4 ? '15天' : '30天';
      return `距离第一次观看${item.daysSinceFirstPlay}天（${intervalText}），建议今天进行视频复习`;
    }
    return null;
  };

  const getCurrentItems = () => {
    switch (previewType) {
      case 'new':
        return preview.newVideos;
      case 'review':
        return preview.reviews;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  if (currentItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          {previewType === 'new' && (
            <>
              {preview.isExtraSession ? <Plus className="mr-3 text-orange-600" size={28} /> : <Calendar className="mr-3 text-green-600" size={28} />}
              {preview.isExtraSession ? '加餐学习预览' : '今日新学预览'}
            </>
          )}
          {previewType === 'review' && (
            <>
              <Headphones className="mr-3 text-yellow-600" size={28} />
              复习预览
            </>
          )}
        </h2>
        
        <div className="text-center py-8">
          <Calendar size={64} className="mx-auto text-green-500 mb-4" />
          <p className="text-xl text-gray-600 mb-2">
            {previewType === 'new' && (preview.isExtraSession ? '没有可加餐的内容' : '今天没有新学任务')}
            {previewType === 'audio' && '今天没有音频复习任务'}
            {previewType === 'video' && '今天没有视频复习任务'}
          </p>
          <p className="text-gray-500">
            {previewType === 'new' && (preview.isExtraSession 
              ? '所有视频都已开始学习或没有活跃的合辑' 
              : '可以休息一下或添加新的视频内容'
            )}
            {previewType === 'audio' && '所有复习任务都已完成'}
            {previewType === 'video' && '没有需要进行视频复习的内容'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        {previewType === 'new' && (
          <>
            {preview.isExtraSession ? <Plus className="mr-3 text-orange-600" size={28} /> : <Calendar className="mr-3 text-green-600" size={28} />}
            {preview.isExtraSession ? '加餐学习预览' : '今日新学预览'}
          </>
        )}
        {previewType === 'review' && (
          <>
            <Headphones className="mr-3 text-yellow-600" size={28} />
            复习预览
          </>
        )}
        <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
          previewType === 'new' 
            ? (preview.isExtraSession ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          共 {currentItems.length} 个
        </span>
      </h2>

      {preview.isExtraSession && previewType === 'new' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Plus className="text-orange-600 mr-2" size={20} />
            <p className="text-orange-800 font-medium">加餐模式</p>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            今日常规学习任务已完成，这是额外的学习内容
          </p>
        </div>
      )}

      {previewType === 'review' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Headphones className="text-yellow-600 mr-2" size={20} />
            <p className="text-yellow-800 font-medium">复习模式</p>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            支持音频或视频播放，可以在通勤、运动或专注时进行复习
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className={`rounded-lg p-4 ${
          previewType === 'new' ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 flex items-center ${
            previewType === 'new' ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {previewType === 'new' && <Play className="mr-2" size={20} />}
            {previewType === 'new' && (
              (() => {
                const learnedCount = currentItems.filter((item: any) =>
                  item.originalIndex !== undefined && preview.lastPlayedIndex !== undefined && item.originalIndex < preview.lastPlayedIndex
                ).length;
                return `新学习（${currentItems.length}个）`;
              })()
            )}
            {previewType === 'review' && `复习 (${currentItems.length}个)`}
          </h3>
          <div className="space-y-3">
            {currentItems.map((item, index) => {
              // 调试输出，便于观察断点和索引
              if (previewType === 'new') {
                // eslint-disable-next-line no-console
                console.log('item.originalIndex:', (item as any).originalIndex, 'lastPlayedIndex:', preview.lastPlayedIndex);
              }
              const reviewPrompt = getReviewPrompt(item);
              let learnedMark = '';
              if (previewType === 'new') {
                const origIdx = (item as any).originalIndex;
                if (origIdx !== undefined && preview.lastPlayedIndex !== undefined && origIdx < preview.lastPlayedIndex) {
                  learnedMark = '（已学）';
                }
              }
              return (
                <div key={index} className={`p-3 rounded-lg border ${
                  previewType === 'new' ? 'bg-white border-green-200' : 'bg-white border-yellow-200'
                }`}>
                  <div className={`font-medium ${
                    previewType === 'new' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {index + 1}. {getVideoName(item.videoId)}{learnedMark}
                  </div>
                  {reviewPrompt && (
                    <div className="bg-orange-100 border border-orange-200 rounded p-2 mt-2 flex items-start">
                      <Lightbulb className="text-orange-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-orange-800 text-sm font-medium">
                        {reviewPrompt}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onStartPlaylist}
          className={`px-8 py-3 rounded-lg font-semibold text-lg flex items-center mx-auto transition-colors shadow-md hover:shadow-lg text-white ${
            previewType === 'new' 
              ? (preview.isExtraSession ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700')
              : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {previewType === 'new' && <Play size={24} className="mr-3" />}
          开始播放
        </button>
      </div>
    </div>
  );
};