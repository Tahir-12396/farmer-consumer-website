import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const OrderTimeline = ({ currentStatus }) => {
  const { t } = useLanguage();

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-center space-x-2 text-kisan-danger text-xs font-semibold">
        <XCircle className="w-4 h-4 flex-shrink-0" />
        <span>This order has been cancelled.</span>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: t('statusPending'), icon: Clock },
    { key: 'Accepted', label: t('statusAccepted'), icon: CheckCircle2 },
    { key: 'Preparing', label: t('statusPreparing'), icon: Package },
    { key: 'Ready for Dispatch', label: t('statusReady'), icon: Truck },
    { key: 'Completed', label: t('statusCompleted'), icon: Check },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Accepted': return 1;
      case 'Preparing': return 2;
      case 'Ready for Dispatch': return 3;
      case 'Completed': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        {/* Background connecting bar */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-0">
          <div
            className="h-full bg-kisan-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm
                  ${isCurrent
                    ? 'bg-kisan-primary text-white ring-4 ring-kisan-light'
                    : isDone
                      ? 'bg-kisan-primary text-white'
                      : 'bg-white text-gray-400 border border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  text-[10px] mt-1.5 text-center font-medium max-w-[64px] truncate
                  ${isDone ? 'text-kisan-dark font-bold' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
