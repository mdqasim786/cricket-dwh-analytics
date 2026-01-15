import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

function App() {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({ item: '', city: 'Karachi', price: '' });

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  }, []);

  // ANALYTICS LOGIC: Calculate Sales per City for the Chart
  const chartData = useMemo(() => {
    const cities = { Karachi: 0, Lahore: 0, Islamabad: 0 };
    sales.forEach(sale => {
      if (cities[sale.city] !== undefined) {
        cities[sale.city] += sale.price;
      }
    });
    return Object.keys(cities).map(city => ({
      name: city,
      total: cities[city]
    }));
  }, [sales]);

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
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Revenue</p>
              <p className="text-xl font-black text-emerald-400">${chartData.reduce((a, b) => a + b.total, 0)}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* TOP SECTION: Analytics Chart */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl shadow-2xl overflow-hidden">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Regional Sales Distribution
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total === Math.max(...chartData.map(o => o.total)) && entry.total !== 0 ? '#10b981' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-emerald-400">Log Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400 ml-1">Gear Item</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g. Gray Nicolls Bat"
                    value={formData.item}
                    onChange={(e) => setFormData({...formData, item: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 ml-1">City</label>
                  <select 
                    className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option>Karachi</option>
                    <option>Lahore</option>
                    <option>Islamabad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 ml-1">Price (USD)</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  UPDATE WAREHOUSE
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-tighter">
                  <tr>
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-5 font-bold">{sale.item}</td>
                      <td className="px-6 py-5 text-slate-400">{sale.city}</td>
                      <td className="px-6 py-5 text-right font-mono text-emerald-400 font-bold">${sale.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;