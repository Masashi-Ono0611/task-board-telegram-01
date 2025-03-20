"use client";

import { useState } from 'react';
import { addTask } from '../lib/firebase';

interface TaskFormProps {
  groupId: string;
}

/* デバッグ関連のインターフェース - 必要に応じてコメントを外して使用可能
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
*/

export default function TaskForm({ groupId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  /* デバッグ関連のstate - 必要に応じてコメントを外して使用可能
  const [debug, setDebug] = useState<DebugState>({ groupId, submissions: [] });

  useEffect(() => {
    console.log('TaskForm received groupId:', groupId);
    setDebug(prev => ({ ...prev, groupId }));
  }, [groupId]);
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    
    try {
      const newTask = {
        title,
        completed: false,
        groupId,
        createdAt: new Date().toISOString()
      };
      
      await addTask(newTask);
      
      /* デバッグ情報の更新 - 必要に応じてコメントを外して使用可能
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
      */
      
      setTitle('');
      
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem', padding: '1rem', borderWidth: '1px', borderRadius: '0.5rem', backgroundColor: 'white' }}>
      <form onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>新しいタスク</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #E2E8F0'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#3182CE',
              color: 'white',
              padding: '0.5rem 2rem',
              borderRadius: '0.25rem',
              border: 'none',
              opacity: loading || !title.trim() ? 0.5 : 1,
              cursor: loading || !title.trim() ? 'not-allowed' : 'pointer'
            }}
            disabled={loading || !title.trim()}
          >
            {loading ? '追加中...' : '追加'}
          </button>
        </div>
      </form>
    </div>
  );
} 