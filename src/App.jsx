import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

function App() {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({ item: '', city: 'Karachi', price: '' });
  
  // States for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  }, []);

  const chartData = useMemo(() => {
    const cities = { Karachi: 0, Lahore: 0, Islamabad: 0 };
    sales.forEach(sale => {
      if (cities[sale.city] !== undefined) cities[sale.city] += sale.price;
    });
    return Object.keys(cities).map(city => ({ name: city, total: cities[city] }));
  }, [sales]);

  // CREATE logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.price) return;
    await addDoc(collection(db, "sales"), {
      ...formData,
      price: Number(formData.price),
      timestamp: new Date()
    });
    setFormData({ item: '', city: 'Karachi', price: '' });
  };

  // DELETE logic
  const handleDelete = async (id) => {
    if (window.confirm("Remove this record from the warehouse?")) {
      await deleteDoc(doc(db, "sales", id));
    }
  };

  // EDIT logic - Open Modal
  const startEdit = (sale) => {
    setCurrentSale(sale);
    setIsEditing(true);
  };

  // UPDATE logic - Save changes
  const handleUpdate = async (e) => {
    e.preventDefault();
    const saleRef = doc(db, "sales", currentSale.id);
    await updateDoc(saleRef, {
      item: currentSale.item,
      city: currentSale.city,
      price: Number(currentSale.price)
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-10">
      {/* Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏏</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Cricket Legends Analytics
            </h1>
          </div>
          <p className="text-xl font-black text-emerald-400">Total: ${chartData.reduce((a, b) => a + b.total, 0)}</p>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Analytics Chart */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-emerald-500 rounded-full"></span>Regional Sales</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={14} />
                <YAxis stroke="#94a3b8" fontSize={14} />
                <Tooltip contentStyle={{ backgroundColor: 'emerald', borderRadius: '12px' }} />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.total === Math.max(...chartData.map(o => o.total)) ? '#10b981' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400">Log Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl outline-none" placeholder="Item Name" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} />
                <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                  <option>Karachi</option><option>Lahore</option><option>Islamabad</option>
                </select>
                <input type="number" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl outline-none" placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                <button className="w-full hover:cursor-pointer hover:bg-emerald-600 bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black">UPDATE WAREHOUSE</button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
                  <tr><th className="px-6 py-4 text-left">Item Details</th><th className="px-6 py-4 text-left">City</th><th className="px-6 py-4 text-right">Price</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-5 flex items-center gap-3">
                        {/* Edit/Delete Buttons appear on hover or stay subtle */}
                        <button onClick={() => handleDelete(sale.id)} className="text-slate-500 hover:bg-red-600 hover:rounded-3xl hover:cursor-pointer transition-colors">🗑️</button>
                        <button onClick={() => startEdit(sale)} className="text-slate-500 hover:bg-green-600 hover:rounded-3xl hover:cursor-pointer transition-colors">✏️</button>
                        <span className="font-bold">{sale.item}</span>
                      </td>
                      <td className="px-6 py-5 text-slate-400">{sale.city}</td>
                      <td className="px-6 py-5 text-right text-emerald-400 font-bold">${sale.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL POPUP */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Edit Record</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.item} onChange={(e) => setCurrentSale({...currentSale, item: e.target.value})} />
              <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.city} onChange={(e) => setCurrentSale({...currentSale, city: e.target.value})}>
                <option>Karachi</option><option>Lahore</option><option>Islamabad</option>
              </select>
              <input type="number" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.price} onChange={(e) => setCurrentSale({...currentSale, price: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-4 py-3 bg-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;