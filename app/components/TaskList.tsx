"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  groupId: string;
}

/* デバッグ関連のインターフェース - 必要に応じてコメントを外して使用可能
interface QueryDebugInfo {
  collection: string;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  orderBy: Array<{
    field: string;
    direction: string;
  }>;
}

interface DebugQueryResult {
  timestamp: string;
  query: QueryDebugInfo;
  resultCount: number;
  results: Task[];
}
*/

export default function TaskList({ groupId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /* デバッグ関連のstate - 必要に応じてコメントを外して使用可能
  const [debugQueries, setDebugQueries] = useState<DebugQueryResult[]>([]);
  */

  useEffect(() => {
    if (!db) {
      console.error('Firestore is not initialized or null');
      setError('データベースの初期化に失敗しました');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const tasksCollection = collection(db, 'tasks');
      
      const q = query(
        tasksCollection,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      /* デバッグ情報 - 必要に応じてコメントを外して使用可能
      const queryDebugInfo = {
        collection: 'tasks',
        filters: [
          { field: 'groupId', operator: '==', value: groupId }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      };
      */
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const taskList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            } as Task;
          });
          
          setTasks(taskList);
          /* デバッグ情報の更新 - 必要に応じてコメントを外して使用可能
          setDebugQueries(prev => [...prev, {
            timestamp: new Date().toISOString(),
            query: queryDebugInfo,
            resultCount: taskList.length,
            results: taskList
          }]);
          */
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching tasks:', err);
          setError(`タスクの取得に失敗しました: ${err.message}`);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(`クエリの設定に失敗しました: ${err}`);
      setLoading(false);
    }
  }, [groupId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ 
          display: 'inline-block',
          border: '4px solid rgba(66, 153, 225, 0.2)',
          borderRadius: '50%',
          borderTop: '4px solid rgba(66, 153, 225, 0.8)',
          width: '2rem',
          height: '2rem',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '1rem', color: '#4A5568' }}>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#FFF5F5', 
        borderLeft: '4px solid #F56565',
        borderRadius: '0.25rem',
        color: '#C53030'
      }}>
        <p style={{ fontWeight: 'bold' }}>エラーが発生しました</p>
        <p>{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <p style={{ color: '#718096', fontSize: '1.125rem' }}>タスクはありません</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
} 