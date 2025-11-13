import { useState, useEffect } from 'react';
import { supabase } from './supabase-client';
import './App.css';

export default function App() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // State for editing: tracks if a task is being edited and holds the current edited data
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({ id: null, title: "", description: "" });

  // --- READ ---
  const ReadTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false }); 

    if (error) {
      console.error("Error reading tasks: ", error.message);
    } else {
      setTasks(data);
    }
    setIsLoading(false);
  };

  // --- CREATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("tasks")
      .insert({ title: newTask.title, description: newTask.description }) 
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
    }
    
    setNewTask({ title: "", description: "" });
  };
  
  // --- DELETE ---
  // Note: Using window.confirm() for simplicity here; for a production app, use a custom modal.
  const DeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting task: ", error.message);
    } 
  };

  // --- UPDATE (EDIT MODE HANDLERS) ---
  const startEdit = (task) => {
    setIsEditing(true);
    // Populate the currentTask state with the task data being edited
    setCurrentTask({ id: task.id, title: task.title, description: task.description });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("tasks")
      .update({ title: currentTask.title, description: currentTask.description })
      .eq('id', currentTask.id)
      .single();

    if (error) {
      console.error("Error updating task: ", error.message);
    } else {
      setIsEditing(false); // Exit edit mode
      setCurrentTask({ id: null, title: "", description: "" }); // Clear current task
    }
  };

  // Initial Data Fetch & Real-time Subscription Setup
  useEffect(() => {
    ReadTasks();

    const tasksChannel = supabase
      .channel('tasks_changes') 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        // Re-fetch data whenever a change event is received
        ReadTasks(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, []);

  return (
    <div className='App-Container'> 
      <h2>Task Manager CRUD</h2> 

      <form onSubmit={handleSubmit} style = {{ marginBottom: "1rem" }}>

        <input
          type="text"
          placeholder='Task Title'
          value={newTask.title}
          onChange={(e) => {
            setNewTask((prev) => ({ ...prev, title: e.target.value }));
          }}
          required
        />
        
        <textarea
          placeholder='Task Description'
          value={newTask.description}
          onChange={(e) => {
            setNewTask((prev) => ({ ...prev, description: e.target.value }));
          }}
          required
        />

        <button type="submit">Add Task</button>

      </form>

      {/* Conditional rendering for loading state or task list */}
      {isLoading ? (
          <p style={{ textAlign: 'center', color: '#f0f0f0' }}>Loading tasks...</p>
      ) : (
        <ul className='task-list'>
          {tasks.map((task) => (
            <li key={task.id} className='task-item'>
              
              {/* Logic: If isEditing is true AND the current task ID matches, show the edit form */}
              {isEditing && currentTask.id === task.id ? (
                // --- EDIT MODE FORM ---
                <form onSubmit={handleUpdate} style={{ padding: 0, marginBottom: 0, boxShadow: 'none', background: 'none', gap: '8px' }}>
                  <input
                    type="text"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <textarea
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
                    required
                    style={{ height: '80px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>

              ) : (
                // --- READ/VIEW MODE ---
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                      {/* Hook up the Edit and Delete handlers */}
                      <button onClick={() => startEdit(task)}>Edit</button>
                      <button onClick={() => DeleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}

          {tasks.length === 0 && !isLoading && (
            <p style={{ textAlign: 'center', color: '#b0b0b0' }}>No tasks found. Add a new one!</p>
          )}
        </ul>
      )}
    </div>
  )
}