import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      setCategories(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/catalog/categories/${editId}` : `/api/catalog/categories`;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        setName('');
        setEditId(null);
        fetchData();
      } else {
        alert("Xatolik");
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/catalog/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <h2 className="font-bold text-xl">Kategoriyalar</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Kategoriya nomi" 
          required
          className="flex-1 border p-3 rounded-xl outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium">
          {editId ? 'Saqlash' : "Qo'shish"}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setName(''); }} className="bg-gray-200 px-4 py-3 rounded-xl font-medium">
            Bekor
          </button>
        )}
      </form>

      {loading ? <div>Yuklanmoqda...</div> : (
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c.id} className="bg-white p-4 border rounded-xl flex justify-between items-center">
              <span className="font-medium">{c.name}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditId(c.id); setName(c.name); }} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
