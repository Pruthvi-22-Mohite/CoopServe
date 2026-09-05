import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Wrench,
  ArrowRight
} from 'lucide-react';

export const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: 'Kothrud, Pune',
    skill: 'Electrician'
  });
  const [error, setError] = useState('');

  const skillOptions = [
    { value: 'Electrician', label: 'Electrician & Home Wiring' },
    { value: 'Plumber', label: 'Plumbing & Pipe Repair' },
    { value: 'House Cleaner', label: 'Deep Cleaning & Sanitization' },
    { value: 'Gardener', label: 'Gardening & Plant Care' },
    { value: 'Carpenter', label: 'Carpentry & Furniture Making' },
    { value: 'Painter', label: 'Painting & Waterproofing' },
    { value: 'Appliance Tech', label: 'Appliance & AC Repair' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...formData,
      role
    };

    const res = await register(payload);
    if (res.success) {
      if (res.user.role === 'SERVICE_PROVIDER') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full">
        <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Join the CoopServe Cooperative</h2>
              <p className="text-xs text-slate-500">Democratizing gig work with fair fees and trust records</p>
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏠 Household Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('SERVICE_PROVIDER')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'SERVICE_PROVIDER'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Service Worker / Pro
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Priya Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="priya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="City / Neighborhood"
                type="text"
                placeholder="e.g. Shivajinagar, Pune"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />
            </div>

            {role === 'SERVICE_PROVIDER' && (
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 animate-in fade-in duration-200">
                <Select
                  label="Primary Trade / Skill"
                  options={skillOptions}
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  helperText="You will be registered in the CoopServe Provider Cooperative Network"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="coop"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration & Join
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
