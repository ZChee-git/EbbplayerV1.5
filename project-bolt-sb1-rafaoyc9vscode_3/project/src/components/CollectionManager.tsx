import React, { useState } from 'react';
import { FolderPlus, Folder, Check, Edit2, Trash2, Play, BarChart3 } from 'lucide-react';
import { Collection, VideoFile } from '../types';

interface CollectionManagerProps {
  collections: Collection[];
  videos: VideoFile[];
  onCreateCollection: (name: string, description?: string) => void;
  onToggleCollection: (collectionId: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onUpdateCollection: (collectionId: string, name: string, description?: string) => void;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  collections,
  videos,
  onCreateCollection,
  onToggleCollection,
  onDeleteCollection,
  onUpdateCollection,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData); // 调试日志
    
    if (formData.name.trim()) {
      if (editingId) {
        console.log('Updating collection:', editingId, formData.name.trim(), formData.description.trim());
        onUpdateCollection(editingId, formData.name.trim(), formData.description.trim());
        setEditingId(null);
      } else {
        console.log('Creating new collection:', formData.name.trim(), formData.description.trim());
        onCreateCollection(formData.name.trim(), formData.description.trim());
        setShowCreateForm(false);
      }
      setFormData({ name: '', description: '' });
    } else {
      console.log('Form validation failed: name is empty');
    }
  };

  const handleEdit = (collection: Collection) => {
    setFormData({ name: collection.name, description: collection.description || '' });
    setEditingId(collection.id);
    setShowCreateForm(true);
  };

  const getCollectionStats = (collectionId: string) => {
    const collectionVideos = videos.filter(v => v.collectionId === collectionId);
    const completed = collectionVideos.filter(v => v.status === 'completed').length;
    return { total: collectionVideos.length, completed };
  };

  const getProgressPercentage = (collectionId: string) => {
    const stats = getCollectionStats(collectionId);
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Folder className="mr-3 text-purple-600" size={28} />
          学习合辑
        </h2>
      </div>
      <div className="flex justify-between items-center mb-6">
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          {collections.filter(c => c.isActive).length} 个活跃
        </span>
        <button
          onClick={() => {
            console.log('New collection button clicked'); // 调试日志
            setShowCreateForm(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <FolderPlus size={20} className="mr-2" />
          新建合辑
        </button>
      </div>

      {/* 创建/编辑表单 */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '编辑合辑' : '创建新合辑'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合辑名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如：小猪佩奇第1季"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述（可选）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="合辑的详细描述..."
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {editingId ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '' });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 合辑列表 */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Folder size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-2">还没有创建合辑</p>
          <p className="text-gray-500">创建合辑来组织你的学习视频</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => {
            const stats = getCollectionStats(collection.id);
            const progress = getProgressPercentage(collection.id);
            
            return (
              <div
                key={collection.id}
                className={`border-2 rounded-lg p-6 transition-all ${
                  collection.isActive 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => onToggleCollection(collection.id)}
                      className={`mr-3 p-1 rounded ${
                        collection.isActive 
                          ? 'text-purple-600 bg-purple-100' 
                          : 'text-gray-400 bg-gray-200'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <div
                      className={`w-4 h-4 rounded-full mr-2`}
                      style={{ backgroundColor: collection.color }}
                    />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(collection)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteCollection(collection.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">进度</span>
                    <span className="font-medium">{stats.completed}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress}% 完成</span>
                    <span>{new Date(collection.dateCreated).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>

                {collection.isActive && (
                  <div className="mt-3 flex items-center text-sm text-purple-600">
                    <Play size={14} className="mr-1" />
                    参与学习计划
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};