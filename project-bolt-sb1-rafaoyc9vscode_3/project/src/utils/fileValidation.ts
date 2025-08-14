/**
 * 文件验证和MIME类型检测工具
 */

// 支持的视频格式
export const SUPPORTED_VIDEO_FORMATS = {
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'mkv': 'video/x-matroska',
  'webm': 'video/webm',
  'flv': 'video/x-flv',
  'm4v': 'video/x-m4v',
  '3gp': 'video/3gpp',
  'ogv': 'video/ogg',
  'ts': 'video/mp2t',
  'mts': 'video/mp2t'
};

// 新增: 支持的音频格式
export const SUPPORTED_AUDIO_FORMATS = {
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'm4a': 'audio/mp4',
  'aac': 'audio/aac',
  'ogg': 'audio/ogg',
  'oga': 'audio/ogg',
  'flac': 'audio/flac'
};

// 合并媒体格式（视频+音频）
const ALL_SUPPORTED_EXTENSIONS: Record<string, string> = {
  ...SUPPORTED_VIDEO_FORMATS,
  ...SUPPORTED_AUDIO_FORMATS
};

/**
 * 验证文件是否为有效的媒体文件（视频或音频）
 */
export function validateVideoFile(file: File): {
  isValid: boolean;
  mimeType: string;
  error?: string;
} {
  // 检查文件是否为空
  if (!file) {
    return {
      isValid: false,
      mimeType: '',
      error: '文件不存在'
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      mimeType: '',
      error: '文件为空'
    };
  }

  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  if (file.size > maxSize) {
    return {
      isValid: false,
      mimeType: '',
      error: '文件大小超过限制 (最大 2GB)'
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return {
      isValid: false,
      mimeType: '',
      error: '无法识别文件格式'
    };
  }

  if (!(extension in ALL_SUPPORTED_EXTENSIONS)) {
    return {
      isValid: false,
      mimeType: '',
      error: `不支持的文件格式: .${extension}`
    };
  }

  const expectedMimeType = ALL_SUPPORTED_EXTENSIONS[extension];

  if (file.type) {
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    if (!isVideo && !isAudio) {
      return {
        isValid: false,
        mimeType: file.type,
        error: `文件MIME类型不正确: ${file.type}`
      };
    }
  }

  return {
    isValid: true,
    mimeType: file.type || expectedMimeType
  };
}

/**
 * 批量验证媒体文件
 */
export function validateVideoFiles(files: File[]): {
  validFiles: File[];
  invalidFiles: { file: File; error: string }[];
  summary: { total: number; valid: number; invalid: number };
} {
  const validFiles: File[] = [];
  const invalidFiles: { file: File; error: string }[] = [];

  files.forEach(file => {
    const validation = validateVideoFile(file);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({ file, error: validation.error || '未知错误' });
    }
  });

  return {
    validFiles,
    invalidFiles,
    summary: { total: files.length, valid: validFiles.length, invalid: invalidFiles.length }
  };
}

/**
 * 生成文件的安全URL
 */
export function createSafeFileUrl(file: File): string {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to create file URL:', error);
    throw new Error('无法为文件创建URL');
  }
}

/**
 * 清理文件URL
 */
export function revokeSafeFileUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('Failed to revoke file URL:', error);
  }
}
