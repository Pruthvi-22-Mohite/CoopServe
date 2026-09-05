import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  Mail,
  Phone,
  MapPin,
  Gift,
  ShieldCheck,
  Award,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

export const CustomerProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCustomerProfile();
        if (res.success && res.profile) {
          setProfile(res.profile);
          setFormData({
            name: res.profile.name || '',
            phone: res.profile.phone || '',
            location: res.profile.location || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
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
      const res = await api.updateCustomerProfile(formData);
      if (res.success) {
        showToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your profile and reward wallet..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Customer Profile & Rewards"
        description="Manage your verified account settings, saved household service addresses, and cooperative community benefits."
        breadcrumbs={['Home', 'Profile']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): User Card & Loyalty Points */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center space-y-4">
            <Avatar
              src={profile?.avatar}
              name={profile?.name}
              size="xl"
              isVerified={true}
              className="mx-auto"
            />
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{profile?.name}</h3>
              <p className="text-xs text-slate-500">{profile?.email}</p>
              <div className="mt-2">
                <Badge variant="coop" size="sm">
                  {profile?.rewards?.tier || 'Silver Co-op Member'}
                </Badge>
              </div>
            </div>

            {/* Cooperative Rewards Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200/80 text-left space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">Cooperative Points</span>
                </div>
                <span className="text-base font-black text-amber-800">
                  {profile?.rewards?.points || 450} Pts
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Earned from verified bookings. Redeemable for ₹45 off any future service.
              </p>
            </div>
          </Card>

          {/* Saved Addresses Preview */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Addresses</h4>
            {profile?.savedAddresses?.map((addr) => (
              <div key={addr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>{addr.label}</span>
                  {addr.isDefault && <Badge variant="success" size="sm">Default</Badge>}
                </div>
                <p className="text-slate-600 leading-relaxed">{addr.address}</p>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Column (8 cols): Edit Profile Form */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 pb-4 mb-5 border-b border-slate-100">
              Account Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={profile?.email}
                  disabled
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="Email cannot be modified in demo mode"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Default City / Location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

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
