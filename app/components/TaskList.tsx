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
    return <div className="text-center">読み込み中...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div>
        <div className="text-center text-gray-500">タスクはありません</div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
} 