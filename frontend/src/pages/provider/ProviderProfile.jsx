import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import {
  User,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Save,
  Star,
  CheckCircle2
} from 'lucide-react';

export const ProviderProfile = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    phone: '+91 98111 22334',
    skill: 'Electrician & Home Wiring',
    location: '',
    vehicleAvailable: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProviderStats();
        if (res.success && res.stats?.provider) {
          setStats(res.stats);
          setFormData({
            name: res.stats.provider.name || 'Rahul Sharma',
            phone: '+91 98111 22334',
            skill: res.stats.provider.skill || 'Electrician & Home Wiring',
            location: res.stats.provider.location || '',
            vehicleAvailable: res.stats.provider.vehicleAvailable ?? false
          });
        }
      } catch (err) {
        console.error('Error fetching provider profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProviderAvailability({ vehicleAvailable: formData.vehicleAvailable });
      setIsSaving(false);
      showToast('Worker profile updated successfully!', 'success');
    } catch (err) {
      setIsSaving(false);
      showToast(err.message || 'Failed to update worker profile', 'error');
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading worker credentials and Trust Score..." />;
  }

  const provider = stats?.provider || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Profile & Verified Credentials"
        description="Your public cooperative technician card, trade certifications, and Trust Score telemetry."
        breadcrumbs={['Home', 'Profile']}
        badge={
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Technician
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Worker Badge Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 text-center space-y-4 bg-white">
            <Avatar
              src={provider.avatar}
              name={provider.name}
              size="xl"
              isVerified={true}
              className="mx-auto"
            />
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{formData.name}</h3>
              <p className="text-xs font-bold text-emerald-800">{formData.skill}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <Badge variant="coop" size="sm">
                  {provider.workerId || provider.id}
                </Badge>
                <Badge variant="protected" size="sm">
                  90% Direct Payout
                </Badge>
              </div>
            </div>

            {/* Trust Telemetry Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">CoopServe Trust Score</span>
                <span className="text-base font-black text-indigo-700">
                  {provider.trustScore || 0}/100
                </span>
              </div>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                Vehicle available: {provider.vehicleAvailable ? 'Yes' : 'No'}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column (8 cols): Edit Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Professional Details
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Trade & Specialization"
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  leftIcon={<Award className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Contact Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Primary Base Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={formData.vehicleAvailable} onChange={(e) => setFormData({ ...formData, vehicleAvailable: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Vehicle available for service visits
              </label>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
