import React from 'react';
import {
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  Rectangle,
  ScatterChart,
  Scatter,
} from 'recharts';

interface WorkloadData {
  teacher: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
}

interface TeacherWorkloadProps {
  data: WorkloadData[];
  title: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{d.teacher}</p>
        <p className="text-sm text-gray-700">
          {d.day}: <span className="font-medium">{d.value} hours</span>
        </p>
      </div>
    );
  }
  return null;
};

const TeacherWorkload: React.FC<TeacherWorkloadProps> = ({ data, title }) => {
  const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formattedData = data.flatMap((item, teacherIndex) => [
    { teacher: item.teacher, day: 'Monday',    value: item.monday,    x: 0, y: teacherIndex },
    { teacher: item.teacher, day: 'Tuesday',   value: item.tuesday,   x: 1, y: teacherIndex },
    { teacher: item.teacher, day: 'Wednesday', value: item.wednesday, x: 2, y: teacherIndex },
    { teacher: item.teacher, day: 'Thursday',  value: item.thursday,  x: 3, y: teacherIndex },
    { teacher: item.teacher, day: 'Friday',    value: item.friday,    x: 4, y: teacherIndex },
    { teacher: item.teacher, day: 'Saturday',  value: item.saturday,  x: 5, y: teacherIndex },
  ]);

  const teachers = data.map(d => d.teacher);
  const xTicks = [0, 1, 2, 3, 4, 5];
  const yTicks = teachers.map((_, i) => i);

  const getColor = (value: number) => {
    if (value === 0) return '#ebedf0';
    if (value <= 2) return '#EFF6FF';
    if (value <= 4) return '#DBEAFE';
    if (value <= 6) return '#93C5FD';
    if (value <= 8) return '#60A5FA';
    return '#2563EB';
  };

  const CustomShape = (props: any) => {
    const { cx, cy, value, width } = props;
    // Scale size based on container width (width is passed from ResponsiveContainer)
    const size = Math.max(14, Math.min(26, width / 25)); 
    return (
      <Rectangle
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        rx={4}
        fill={getColor(value)}
        className="transition-colors duration-200 hover:opacity-80"
      />
    );
  };

  // Detect screen width for margins and fonts
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const margin = isMobile
    ? { top: 20, right: 10, bottom: 20, left: 80 }
    : { top: 30, right: 30, bottom: 24, left: 120 };
  const fontSize = isMobile ? 10 : 12;

  return (
    <div className="card h-full overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">Hours taught per day</p>
      </div>

      <div className="h-72 min-w-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={margin}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, 5.5]}
              ticks={xTicks}
              tickFormatter={(v) => daysShort[v]}
              tick={{ fontSize }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-0.5, teachers.length - 0.5]}
              ticks={yTicks}
              tickFormatter={(v) => teachers[v]}
              tick={{ fontSize }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Scatter
              data={formattedData}
              shape={(p) => <CustomShape {...p} width={window.innerWidth} />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end mt-4 text-xs text-gray-500 space-x-2">
        <span>Less</span>
        {[0, 2, 4, 6, 8].map((v) => (
          <div key={v} className="w-3 h-3 rounded" style={{ backgroundColor: getColor(v) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default TeacherWorkload;
