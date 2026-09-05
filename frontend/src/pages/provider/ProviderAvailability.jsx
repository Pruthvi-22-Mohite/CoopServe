import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Power,
  ShieldCheck,
  Save,
  Navigation
} from 'lucide-react';

export const ProviderAvailability = () => {
  const { showToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState('Available Today');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const puneLocalities = [
    'Shivajinagar',
    'Kothrud',
    'Deccan Gymkhana',
    'Aundh',
    'Baner',
    'Hadapsar',
    'Karve Nagar',
    'Viman Nagar',
    'Kalyani Nagar',
    'Warje'
  ];

  useEffect(() => {
    const fetchAvail = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProviderAvailability();
        if (res.success && res.availability) {
          setIsAvailable(res.availability.isAvailable ?? true);
          setAvailabilityStatus(res.availability.availabilityStatus || 'Available Today');
          setSelectedAreas(res.availability.serviceAreas || ['Shivajinagar', 'Kothrud', 'Deccan']);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvail();
  }, []);

  const handleToggleArea = (area) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateProviderAvailability({
        isAvailable,
        availabilityStatus: isAvailable ? availabilityStatus : 'Off Duty',
        serviceAreas: selectedAreas
      });
      if (res.success) {
        showToast('Availability preferences updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update availability', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading availability settings..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duty Status & Service Coverage Area"
        description="Control your real-time dispatch availability and choose which Pune localities you want to receive smart job matches for."
        breadcrumbs={['Home', 'Availability']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Main Duty Toggle */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Duty Toggle</h3>
                <p className="text-xs text-slate-500">Enable to receive AI matched bookings</p>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                  isAvailable ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Power className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs ${
              isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="font-bold block">
                {isAvailable ? '🟢 Online & Ready for Dispatch' : '⚪ Off Duty'}
              </span>
              <p className="text-[11px] mt-0.5">
                {isAvailable
                  ? 'Your profile is highlighted in the Smart Matching engine for customers in your service hubs.'
                  : 'You will not receive new instant dispatch requests until turned on.'}
              </p>
            </div>

            {isAvailable && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Availability Slot Status
                </label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Available Today">Available Today (Instant Dispatch)</option>
                  <option value="Available Tomorrow">Available Tomorrow (Pre-scheduled)</option>
                </select>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (7 cols): Pune Localities Coverage Selection */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Pune Service Localities</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the areas within Pune where you want to accept jobs ({selectedAreas.length} selected).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {puneLocalities.map((loc) => {
                const isChecked = selectedAreas.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleToggleArea(loc)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{loc}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="md"
                isLoading={isSaving}
                onClick={handleSave}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Availability Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
