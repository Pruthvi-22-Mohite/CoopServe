import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Settings as SettingsIcon,
  Save,
  ShieldCheck,
  Percent,
  Sliders,
  Bell
} from 'lucide-react';

export const AdminSettings = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [workerShare, setWorkerShare] = useState(90);
  const [opsShare, setOpsShare] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (Number(workerShare) + Number(opsShare) !== 100) {
      showToast(t('admin_settings_sum_error'), 'error');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(t('admin_settings_save_success'), 'success');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_settings_title')}
        description={t('admin_settings_desc')}
        breadcrumbs={['Home', 'Admin', 'Settings']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-6 bg-white space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('admin_settings_fee_title')}</h3>
              <p className="text-xs text-slate-500">{t('admin_settings_fee_sub')}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin_settings_worker_share')}
                  type="number"
                  value={workerShare}
                  onChange={(e) => setWorkerShare(e.target.value)}
                  leftIcon={<Percent className="w-4 h-4 text-emerald-600" />}
                  required
                />
                <Input
                  label={t('admin_settings_ops_share')}
                  type="number"
                  value={opsShare}
                  onChange={(e) => setOpsShare(e.target.value)}
                  leftIcon={<Percent className="w-4 h-4 text-slate-600" />}
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-bold text-slate-800">
                <span>{t('admin_settings_total_label')}</span>
                <span className={Number(workerShare) + Number(opsShare) === 100 ? 'text-emerald-700' : 'text-rose-600'}>
                  {Number(workerShare) + Number(opsShare)}%
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {t('admin_settings_save_btn')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('admin_settings_coop_badge')}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t('admin_settings_coop_desc')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
