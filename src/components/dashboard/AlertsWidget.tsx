import React from 'react';
import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success';
  message: string;
  time: string;
}

interface AlertsWidgetProps {
  alerts: Alert[];
  title: string;
}

const AlertIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={16} className="text-warning-500" />;
    case 'error':
      return <AlertTriangle size={16} className="text-error-500" />;
    case 'success':
      return <CheckCircle2 size={16} className="text-success-500" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, title }) => {
  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className="text-xs font-medium text-white bg-primary-600 rounded-full h-6 min-w-6 px-2 flex items-center justify-center">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3 rounded-md text-sm flex items-start transition-colors ${
                alert.type === 'error' 
                  ? 'bg-error-50 border-l-4 border-error-500'
                  : alert.type === 'warning'
                    ? 'bg-warning-50 border-l-4 border-warning-500'
                    : 'bg-success-50 border-l-4 border-success-500'
              }`}
            >
              <div className="mr-3 pt-0.5">
                <AlertIcon type={alert.type} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Bell size={24} className="mx-auto mb-2 text-gray-400" />
            <p>No alerts at this time</p>
          </div>
        )}
      </div>
      
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;