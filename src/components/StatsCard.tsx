import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      
      <div>
        <p className="text-slate-600 mb-1">{title}</p>
        <p className="text-slate-900 mb-2">{value}</p>
        <p className={`${trendUp ? 'text-green-600' : 'text-slate-500'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
