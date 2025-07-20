import { useState, useEffect } from 'react';
import { VideoFile, LearningStats } from '../types';

export function useVideoManager() {
  const [videos, setVideos] = useState<VideoFile[]>([]);

  // 生成UUID的兼容函数
  const generateUUID = () => {
    // 检查是否支持crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // 降级方案
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const addVideo = (file: File, collectionId: string) => {
    const newVideo: VideoFile = {
      id: generateUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      file,
      fileUrl: URL.createObjectURL(file),
      dateAdded: new Date(),
      status: 'new',
      reviewCount: 0,
      collectionId,
      fileSize: file.size,
      mimeType: file.type,
    };

    setVideos(prev => [...prev, newVideo]);
    return newVideo.id;
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => {
      const deletedVideo = prev.find(video => video.id === videoId);
      if (deletedVideo && deletedVideo.fileUrl) {
        URL.revokeObjectURL(deletedVideo.fileUrl);
      }
      return prev.filter(video => video.id !== videoId);
    });
  };

  const getStats = (): LearningStats => {
    const totalVideos = videos.length;
    const completedVideos = videos.filter(v => v.status === 'completed').length;
    
    return {
      totalVideos,
      completedVideos,
      todayNewCount: 0,
      todayAudioReviewCount: 0,
      todayVideoReviewCount: 0,
      overallProgress: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
      activeCollections: 0,
      canAddExtra: false,
    };
  };

  // 清理 object URLs
  useEffect(() => {
    return () => {
      videos.forEach(video => {
        if (video.fileUrl) {
          URL.revokeObjectURL(video.fileUrl);
        }
      });
    };
  }, []);

  return {
    videos,
    addVideo,
    deleteVideo,
    getStats,
  };
};