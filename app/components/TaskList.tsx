"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  groupId: string;
}

export default function TaskList({ groupId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugQueries, setDebugQueries] = useState<any[]>([]);

  useEffect(() => {
    console.log('TaskList component mounted with groupId:', groupId);
    if (!db) {
      console.error('Firestore is not initialized');
      setError('データベースの初期化に失敗しました');
      setLoading(false);
      return;
    }

    console.log('Fetching tasks for groupId:', groupId);
    setLoading(true);
    
    try {
      // ファイアベースのクエリを構築
      console.log('Building Firestore query for groupId:', groupId);
      const q = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      // クエリのデバッグ情報
      const queryDebugInfo = {
        collection: 'tasks',
        filters: [
          { field: 'groupId', operator: '==', value: groupId }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      };
      
      console.log('Query Debug Info:', queryDebugInfo);
      
      // クエリの実行
      console.log('Executing Firestore query...');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Snapshot received with', snapshot.size, 'documents');
          const taskList = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Document data:', { id: doc.id, ...data });
            return {
              id: doc.id,
              ...data
            } as Task;
          });
          
          console.log('Final taskList:', taskList);
          setTasks(taskList);
          setDebugQueries(prev => [...prev, {
            timestamp: new Date().toISOString(),
            query: queryDebugInfo,
            resultCount: taskList.length,
            results: taskList
          }]);
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
        console.log('Unsubscribing from Firestore query');
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
        {debugQueries.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">クエリデバッグ情報:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(debugQueries, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div>
        <div className="text-center text-gray-500">タスクはありません</div>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">デバッグ情報:</h3>
          <div className="mb-2">
            <strong>現在のグループID:</strong> {groupId}
          </div>
          {debugQueries.length > 0 && (
            <div>
              <h4 className="font-semibold">最新のクエリ:</h4>
              <pre className="text-xs overflow-auto">{JSON.stringify(debugQueries[debugQueries.length - 1], null, 2)}</pre>
            </div>
          )}
        </div>
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
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">デバッグ情報:</h3>
        <div className="mb-2">
          <strong>現在のグループID:</strong> {groupId}
        </div>
        <div className="mb-2">
          <strong>取得タスク数:</strong> {tasks.length}
        </div>
        {debugQueries.length > 0 && (
          <div>
            <h4 className="font-semibold">最新のクエリ:</h4>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(debugQueries[debugQueries.length - 1], null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 