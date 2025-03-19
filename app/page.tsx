'use client';

import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

export default function Home() {
  // テスト用の固定のグループID
  const testGroupId = 'test-group-1';

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">タスクボード</h1>
      <div className="space-y-8">
        <TaskForm groupId={testGroupId} />
        <TaskList groupId={testGroupId} />
      </div>
    </main>
  );
} 