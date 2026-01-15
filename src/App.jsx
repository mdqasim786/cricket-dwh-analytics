import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import './App.css';

function App() {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({ item: '', city: 'Karachi', price: '' });

  // 1. Fetch data from Firebase (The Reporting Layer)
  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  }, []);

  // 2. Save data to Firebase (The Ingestion Layer)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 p-4 text-white shadow-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏏</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Cricket Analytics Hub</h1>
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">DWH v1.0</span>
        </div>
      </nav>
  
      <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Log New Sale</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Gear Item</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
                  placeholder="e.g. CA Plus 15000"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Sale City</label>
                <select 
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price (USD)</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl outline-none text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Amount"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-emerald-500/50 transform hover:scale-[1.02]"
              >
                Process to Warehouse
              </button>
            </div>
          </div>
        </div>
  
        {/* Data Display Table */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Sales Record (Central Warehouse)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/70 text-slate-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Gear Item</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-700/30 transition-colors duration-200">
                      <td className="px-6 py-4 font-semibold text-slate-100">{sale.item}</td>
                      <td className="px-6 py-4 text-slate-300">{sale.city}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold text-lg">${sale.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sales.length === 0 && (
                <div className="p-16 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-slate-500 text-lg">No data found in warehouse.</p>
                </div>
              )}
            </div>
          </div>
        </div>
  
      </div>
    </div>
  );
}

export default App;