import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import './App.css';

function App() {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({ item: '', city: 'Karachi', price: '', quantity: 1 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  }, []);

  // UPDATED ANALYTICS: Now calculates (Price * Quantity) for the chart
  const chartData = useMemo(() => {
    const cities = { Karachi: 0, Lahore: 0, Islamabad: 0 };
    sales.forEach(sale => {
      const totalValue = (sale.price || 0) * (sale.quantity || 1);
      if (cities[sale.city] !== undefined) cities[sale.city] += totalValue;
    });
    return Object.keys(cities).map(city => ({ name: city, total: cities[city] }));
  }, [sales]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.price || !formData.quantity) return;
    await addDoc(collection(db, "sales"), {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      timestamp: new Date()
    });
    setFormData({ item: '', city: 'Karachi', price: '', quantity: 1 });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this record?")) await deleteDoc(doc(db, "sales", id));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "sales", currentSale.id), {
      item: currentSale.item,
      city: currentSale.city,
      price: Number(currentSale.price),
      quantity: Number(currentSale.quantity)
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-10">
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">🏏 Cricket Analytics</h1>
          <p className="text-xl font-black text-emerald-400">Total Revenue: ${chartData.reduce((a, b) => a + b.total, 0)}</p>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Analytics Chart */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl shadow-2xl">
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px' }} />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={50}>
                  <LabelList dataKey="total" position="top" fill="#ffffff" fontSize={12} fontWeight="bold" formatter={(v) => `$${v}`} />
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.total === Math.max(...chartData.map(o => o.total)) && entry.total !== 0 ? '#10b981' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400">Log Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" placeholder="Item Name" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} />
                <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                  <option>Karachi</option><option>Lahore</option><option>Islamabad</option>
                </select>
                <div className="flex gap-2">
                   <input type="number" className="w-2/3 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" placeholder="Unit Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                   <input type="number" className="w-1/3 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" placeholder="Qty" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <button className="w-full bg-emerald-500 text-slate-900 py-4 rounded-xl font-black active:scale-95 transition-transform">UPDATE WAREHOUSE</button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
              <table className="w-full">
                <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 text-left">Item Details</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-5 flex items-center gap-3">
                        <button onClick={() => handleDelete(sale.id)} className="text-slate-500 hover:text-red-500">🗑️</button>
                        <button onClick={() => {setCurrentSale(sale); setIsEditing(true);}} className="text-slate-500 hover:text-blue-400">✏️</button>
                        <div>
                           <p className="font-bold">{sale.item}</p>
                           <p className="text-xs text-slate-500">{sale.city}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-slate-300">x{sale.quantity}</td>
                      <td className="px-6 py-5 text-right text-emerald-400 font-bold">${sale.price * sale.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Updated with Quantity) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Edit Record</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.item} onChange={(e) => setCurrentSale({...currentSale, item: e.target.value})} />
              <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.city} onChange={(e) => setCurrentSale({...currentSale, city: e.target.value})}>
                <option>Karachi</option><option>Lahore</option><option>Islamabad</option>
              </select>
              <div className="flex gap-2">
                <input type="number" className="w-2/3 p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.price} onChange={(e) => setCurrentSale({...currentSale, price: e.target.value})} />
                <input type="number" className="w-1/3 p-3 bg-slate-900 border border-slate-700 rounded-xl" value={currentSale.quantity} onChange={(e) => setCurrentSale({...currentSale, quantity: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-4 py-3 bg-slate-700 rounded-xl">Cancel</button>
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