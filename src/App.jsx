import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="bg-cricketGreen p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🏏 Cricket Analytics Hub</h1>
          <span className="hidden sm:inline bg-green-700 px-3 py-1 rounded-full text-sm">DWH v1.0</span>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-cricketGreen">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Log New Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Gear Item</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. CA Plus 15000"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Sale City</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Price (USD)</label>
                <input 
                  type="number" 
                  className="w-full mt-1 p-2 border rounded-lg outline-none"
                  placeholder="Amount"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <button className="w-full bg-cricketGreen text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
                Process to Warehouse
              </button>
            </form>
          </div>
        </div>

        {/* Data Display Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Sales Record (Central Warehouse)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Gear Item</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-green-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{sale.item}</td>
                      <td className="px-6 py-4 text-gray-600">{sale.city}</td>
                      <td className="px-6 py-4 text-cricketGreen font-bold">${sale.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sales.length === 0 && <p className="p-10 text-center text-gray-400">No data found in warehouse.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;