import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, AlertCircle } from 'lucide-react';
import { PlaylistItem, VideoFile } from '../types';

interface VideoPlayerProps {
  playlist: PlaylistItem[];
  videos: VideoFile[];
  onClose: () => void;
  onPlaylistComplete: () => void;
  initialIndex?: number;
  isAudioMode?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playlist,
  videos,
  onClose,
  onPlaylistComplete,
  initialIndex = 0,
  isAudioMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [audioOnlyMode, setAudioOnlyMode] = useState(isAudioMode);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = playlist[currentIndex];
  const currentVideo = videos.find(v => v.id === currentItem?.videoId);

  // 检测设备和浏览器
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  // 监听用户交互
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // 控制栏自动隐藏逻辑
  const hideControlsAfterDelay = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000); // 3秒后隐藏
    setControlsTimeout(timeout);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  // 视频加载和事件处理
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      setVideoError(false);
      setIsLoading(true);
      setRetryCount(0);
      
      const video = videoRef.current;
      video.src = '';
      video.load();
      video.src = currentVideo.fileUrl;
      
      if (audioOnlyMode) {
        video.style.display = 'none';
      } else {
        video.style.display = 'block';
      }
      
      if (isIOS && isSafari) {
        video.playsInline = true;
        video.muted = false;
        video.preload = 'auto';
      } else {
        video.preload = 'metadata';
      }
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };

      const handleCanPlay = () => {
        if (userInteracted) {
          setTimeout(() => {
            setIsLoading(false);
            if (currentIndex >= initialIndex) {
              video.play().catch(console.error);
            }
          }, isIOS ? 100 : 500);
        } else {
          setIsLoading(false);
        }
      };

      const handleError = (e: any) => {
        console.error('Video error:', e);
        setVideoError(true);
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [currentIndex, currentVideo, audioOnlyMode, userInteracted, initialIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      showControlsTemporarily();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
    showControlsTemporarily();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    showControlsTemporarily();
  };

  const goToNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onPlaylistComplete();
    }
    showControlsTemporarily();
  };

  const handleVideoEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onPlaylistComplete();
    }
  };

  const retryVideo = () => {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      setVideoError(false);
      setIsLoading(true);
      if (videoRef.current && currentVideo) {
        videoRef.current.src = currentVideo.fileUrl;
        videoRef.current.load();
      }
    }
    showControlsTemporarily();
  };

  if (!currentVideo) {
    // 清除本地未完成的新学习播放列表
    const playlistsRaw = window.localStorage.getItem('playlists');
    if (playlistsRaw) {
      try {
        const playlists = JSON.parse(playlistsRaw);
        const filtered = playlists.filter((p:any) => p.isCompleted || p.playlistType !== 'new');
        window.localStorage.setItem('playlists', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
          <p className="text-xl text-gray-800 mb-4">视频文件未找到</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative w-full h-full">
        {/* Video/Audio Display */}
        {videoError ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <p className="text-lg mb-2">视频加载失败</p>
              <p className="text-sm text-gray-300 mb-4">
                重试次数: {retryCount}/3
              </p>
              <div className="space-y-2">
                <button
                  onClick={retryVideo}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? '重试次数已用完' : '重试'}
                </button>
                <button
                  onClick={goToNext}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  disabled={currentIndex >= playlist.length - 1}
                >
                  跳过此视频
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>正在加载视频...</p>
                </div>
              </div>
            )}
            
            {/* 音频模式显示 */}

            {audioOnlyMode && (
              <div
                className="w-full h-full bg-gradient-to-br from-yellow-900 to-yellow-700 flex flex-col justify-center items-center relative"
                onClick={showControlsTemporarily}
                onTouchStart={showControlsTemporarily}
              >
                <div
                  className="text-center text-white p-8"
                  onClick={showControlsTemporarily}
                  onTouchStart={showControlsTemporarily}
                >
                  <div className="text-6xl mb-6">🎵</div>
                  <h2 className="text-2xl font-bold mb-2">{currentVideo.name}</h2>
                  <p className="text-yellow-200 mb-4">音频复习模式</p>
                </div>
                {/* 音频模式下的工具栏，始终可见且不被遮挡 */}
                {!videoError && showControls && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 z-20">
                    <div className="mb-6">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-white text-sm mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-8">
                      <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="text-white p-4 rounded-full hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SkipBack size={54} />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="bg-white/20 text-white p-6 rounded-full hover:bg-white/30 transition-all"
                        disabled={isLoading}
                      >
                        {isPlaying ? <Pause size={60} /> : <Play size={60} />}
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={currentIndex === playlist.length - 1}
                        className="text-white p-4 rounded-full hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SkipForward size={54} />
                      </button>
                      <button
                        onClick={onClose}
                        className="text-white p-4 rounded-full hover:bg-white/20 transition-all"
                      >
                        <X size={54} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <video
              ref={videoRef}
              className={`w-full h-full bg-black ${audioOnlyMode ? 'hidden' : 'block'}`}
              onPlay={() => {
                setIsPlaying(true);
                hideControlsAfterDelay();
              }}
              onPause={() => {
                setIsPlaying(false);
                setShowControls(true);
                if (controlsTimeout) {
                  clearTimeout(controlsTimeout);
                }
              }}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
              onClick={showControlsTemporarily}
              onTouchStart={showControlsTemporarily}
              playsInline={true}
              controls={false}
              style={{ objectFit: 'contain' }}
            />
          </>
        )}
        
        {/* Controls Overlay - 只在需要时显示 */}
        {!videoError && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-white text-sm mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Control Buttons - 3倍大小 */}
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="text-white p-4 rounded-full hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack size={54} />
              </button>
              
              <button
                onClick={togglePlay}
                className="bg-white/20 text-white p-6 rounded-full hover:bg-white/30 transition-all"
                disabled={isLoading}
              >
                {isPlaying ? <Pause size={60} /> : <Play size={60} />}
              </button>
              
              <button
                onClick={goToNext}
                disabled={currentIndex === playlist.length - 1}
                className="text-white p-4 rounded-full hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward size={54} />
              </button>
              
              <button
                onClick={onClose}
                className="text-white p-4 rounded-full hover:bg-white/20 transition-all"
              >
                <X size={54} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
