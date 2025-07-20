import React, { useState } from 'react';

interface TestCollectionProps {
  onCreateCollection: (name: string, description?: string) => void;
  collections: any[];
}

export const TestCollection: React.FC<TestCollectionProps> = ({ onCreateCollection, collections }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    console.log('Test create button clicked');
    console.log('Current collections:', collections);
    
    if (name.trim()) {
      console.log('Creating collection with name:', name);
      onCreateCollection(name.trim(), '测试描述');
      setName('');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 m-4 border">
      <h3 className="text-lg font-bold mb-4">测试创建合辑</h3>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入合辑名称"
          className="w-full px-3 py-2 border rounded"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          创建合辑
        </button>
        <div className="mt-4">
          <p className="font-medium">当前合辑数量: {collections.length}</p>
          <pre className="bg-gray-100 p-2 rounded text-sm mt-2">
            {JSON.stringify(collections, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
