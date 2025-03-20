"use client";

import { useState } from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleComplete = async () => {
    try {
      setIsCompleted(!isCompleted);
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !isCompleted,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      setIsCompleted(isCompleted); // 元に戻す
      alert('更新に失敗しました');
    }
  };

  const deleteTask = async () => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'tasks', task.id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
      alert('削除に失敗しました');
    }
  };

  return (
    <div 
      style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.375rem',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        opacity: isDeleting ? 0.5 : 1,
        transition: 'opacity 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={toggleComplete}
            style={{ width: '1.5rem', height: '1.5rem' }}
          />
          <span
            style={{
              fontSize: '1rem',
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? '#718096' : '#2D3748'
            }}
          >
            {task.title}
          </span>
        </div>
        <button
          onClick={deleteTask}
          disabled={isDeleting}
          style={{
            backgroundColor: 'transparent',
            color: '#E53E3E',
            border: 'none',
            borderRadius: '0.25rem',
            padding: '0.5rem',
            cursor: isDeleting ? 'not-allowed' : 'pointer'
          }}
          aria-label="タスクを削除"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 