import React from 'react';
import { History, Calendar, Play, Headphones, Video, CheckCircle } from 'lucide-react';
import { DailyPlaylist, VideoFile } from '../types';


interface PlaylistHistoryProps {
  playlists: DailyPlaylist[];
  videos: VideoFile[];
  onClose: () => void;
  onSinglePlay?: (videoId: string) => void;
}

export const PlaylistHistory: React.FC<PlaylistHistoryProps> = ({
  playlists,
  videos,
  onClose,
  onSinglePlay,
}) => {
  const getVideoName = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    return video?.name || 'Unknown Video';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return <Play size={16} className="text-green-600" />;
      case 'audio': return <Headphones size={16} className="text-yellow-600" />;
      case 'video': return <Video size={16} className="text-purple-600" />;
      default: return <Play size={16} className="text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new': return '新学习';
      case 'audio': return '音频复习';
      case 'video': return '视频复习';
      default: return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-xl flex items-center">
            <History className="mr-3" size={24} />
            播放历史
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <History size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">暂无播放历史</p>
            </div>
          ) : (
            <div className="space-y-6">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 text-blue-600" size={20} />
                      <span className="font-semibold text-gray-800">
                        {playlist.date.toLocaleDateString('zh-CN')}
                      </span>
                      <span className="ml-3 text-sm text-gray-600">
                        共 {playlist.items.length} 个项目
                      </span>
                    </div>
                    <div className="flex items-center">
                      {playlist.isCompleted ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <CheckCircle size={16} className="mr-1" />
                          已完成
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          进行中 ({playlist.lastPlayedIndex}/{playlist.items.length})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {playlist.items.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-lg ${
                          index < playlist.lastPlayedIndex
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          if (onSinglePlay) {
                            onClose(); // 先关闭弹窗
                            setTimeout(() => onSinglePlay(item.videoId), 100); // 再跳转播放器
                          }
                        }}
                        title="点击播放此视频"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getTypeIcon(item.reviewType)}
                            <span className="ml-2 text-sm font-medium">
                              {getTypeText(item.reviewType)}
                            </span>
                          </div>
                          {index < playlist.lastPlayedIndex && (
                            <CheckCircle size={16} className="text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {getVideoName(item.videoId)}
                        </p>
                        {item.reviewNumber > 1 && (
                          <p className="text-xs text-gray-500">
                            第{item.reviewNumber}次复习
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};