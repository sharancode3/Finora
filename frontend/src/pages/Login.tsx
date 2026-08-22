import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState('');

  useEffect(() => {
    api.get('/businesses')
      .then(res => {
        setBusinesses(res.data);
        if (res.data.length > 0) {
          setSelectedBusiness(res.data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load businesses', err);
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and navigate to dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-primary-accent flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Sign in to Finora
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Reconciliation and Analytics for Modern Finance Teams
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-slate-700">
                Organization
              </label>
              <div className="mt-2">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                    <Loader2 className="animate-spin" size={16} /> Loading organizations...
                  </div>
                ) : (
                  <select
                    id="business"
                    name="business"
                    className="block w-full rounded-md border-slate-300 py-2.5 pl-3 pr-10 text-slate-900 focus:border-primary-accent focus:outline-none focus:ring-primary-accent sm:text-sm bg-slate-50 border"
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                  >
                    {businesses.length === 0 && <option value="">Demo Organization</option>}
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Assigned Role
              </label>
              <div className="mt-2 flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-500 sm:text-sm">
                <ShieldCheck size={16} className="text-emerald-500" />
                Finance Admin
              </div>
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full justify-center py-2.5 text-[15px]">
                Enter Finora
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Single Sign-On (SSO) Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
