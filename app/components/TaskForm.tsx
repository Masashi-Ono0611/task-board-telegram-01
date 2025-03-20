"use client";

import { useState, useEffect } from 'react';
import { addTask } from '../lib/firebase';

interface TaskFormProps {
  groupId: string;
}

interface SubmissionData {
  timestamp: string;
  task: {
    title: string;
    completed: boolean;
    groupId: string;
    createdAt: string;
  };
  result: {
    id: string;
  };
}

interface DebugState {
  groupId: string;
  submissions: SubmissionData[];
}

export default function TaskForm({ groupId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<DebugState>({ groupId, submissions: [] });

  // groupIdが変更されたときにデバッグ情報を更新
  useEffect(() => {
    console.log('TaskForm received groupId:', groupId);
    setDebug(prev => ({ ...prev, groupId }));
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    console.log('Submitting new task with groupId:', groupId);
    
    try {
      const newTask = {
        title,
        completed: false,
        groupId,
        createdAt: new Date().toISOString()
      };
      
      console.log('Task data to be submitted:', newTask);
      
      const result = await addTask(newTask);
      
      console.log('Task successfully added with ID:', result.id);
      
      // デバッグ情報を更新
      setDebug(prev => ({
        ...prev,
        submissions: [
          ...prev.submissions,
          {
            timestamp: new Date().toISOString(),
            task: newTask,
            result: { id: result.id }
          }
        ]
      }));
      
      setTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !title.trim()}
          >
            {loading ? '追加中...' : '追加'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
        <div className="font-bold">フォームデバッグ情報:</div>
        <div>グループID: {groupId}</div>
        {debug.submissions.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold">最近の送信:</div>
            <pre className="mt-1 overflow-auto max-h-20">
              {JSON.stringify(debug.submissions[debug.submissions.length - 1], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 