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
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{data.teacher}</p>
        <p className="text-sm text-gray-700">
          {data.day}: <span className="font-medium">{data.value} hours</span>
        </p>
      </div>
    );
  }
  return null;
};

const TeacherWorkload: React.FC<TeacherWorkloadProps> = ({ data, title }) => {
  // Convert data to format required by scatter plot
  const formattedData = data.flatMap((item, teacherIndex) => {
    return [
      { teacher: item.teacher, day: 'Monday', value: item.monday, x: 0, y: teacherIndex },
      { teacher: item.teacher, day: 'Tuesday', value: item.tuesday, x: 1, y: teacherIndex },
      { teacher: item.teacher, day: 'Wednesday', value: item.wednesday, x: 2, y: teacherIndex },
      { teacher: item.teacher, day: 'Thursday', value: item.thursday, x: 3, y: teacherIndex },
      { teacher: item.teacher, day: 'Friday', value: item.friday, x: 4, y: teacherIndex },
      { teacher: item.teacher, day: 'Saturday', value: item.saturday, x: 5, y: teacherIndex },
    ];
  });

  // Color scale for heatmap
  const getColor = (value: number) => {
    if (value === 0) return '#ebedf0';
    if (value <= 2) return '#EFF6FF';
    if (value <= 4) return '#DBEAFE';
    if (value <= 6) return '#93C5FD';
    if (value <= 8) return '#60A5FA';
    return '#2563EB';
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const teachers = data.map(d => d.teacher);

  const CustomShape = (props: any) => {
    const { x, y, value } = props;
    return (
      <Rectangle
        {...props}
        width={30}
        height={30}
        x={x - 15}
        y={y - 15}
        rx={4}
        fill={getColor(value)}
        className="transition-colors duration-200 hover:opacity-80"
      />
    );
  };

  return (
    <div className="card h-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">Hours taught per day</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 30, right: 30, bottom: 20, left: 100 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 5]}
              tickCount={6}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => days[value]}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, teachers.length - 1]}
              tickCount={teachers.length}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => teachers[value]}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Scatter
              data={formattedData}
              shape={<CustomShape />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end mt-4 text-xs text-gray-500 space-x-2">
        <span>Less</span>
        {[0, 2, 4, 6, 8].map((value) => (
          <div
            key={value}
            className="w-3 h-3 rounded"
            style={{ backgroundColor: getColor(value) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default TeacherWorkload;