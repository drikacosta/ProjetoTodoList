import React, { createContext, useState, useEffect } from 'react';
import { firestore } from '../services/firebase';

export const TaskContext = createContext();

export default function TaskContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const snapshot = await firestore.collection('tasks').get();
    const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(loadedTasks);
  };

  const addTask = async (task) => {
    const docRef = await firestore.collection('tasks').add(task);
    setTasks([...tasks, { id: docRef.id, ...task }]);
  };

  const updateTask = async (id, updates) => {
    await firestore.collection('tasks').doc(id).update(updates);
    setTasks(tasks.map(task => (task.id === id ? { ...task, ...updates } : task)));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}
