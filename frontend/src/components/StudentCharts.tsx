'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyEnrollment {
  month: string;
  count: number;
}

interface StudentsPerCourse {
  id: number;
  title: string;
  student_count: number;
}

interface StudentChartsProps {
  monthlyEnrollments: MonthlyEnrollment[];
  studentsPerCourse: StudentsPerCourse[];
  activeStudents: number;
  totalStudents: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

export default function StudentCharts({ monthlyEnrollments, studentsPerCourse, activeStudents, totalStudents }: StudentChartsProps) {
  // Data for pie chart (Active vs Inactive)
  const pieData = [
    { name: 'Pelajar Aktif', value: activeStudents },
    { name: 'Pelajar Tidak Aktif', value: Math.max(0, totalStudents - activeStudents) }
  ];

  // Prepare data for bar chart (limit title length)
  const barChartData = studentsPerCourse.map(course => ({
    ...course,
    title: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    student_count: parseInt(course.student_count) || 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Line Chart - Enrollment Trend */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Tren Pendaftaran Pelajar (6 Bulan Terakhir)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyEnrollments}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#9333ea" 
              strokeWidth={3}
              dot={{ fill: '#9333ea', r: 5 }}
              activeDot={{ r: 7 }}
              name="Jumlah Pendaftaran"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Active vs Inactive Students */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Status Pelajar
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Aktif: {activeStudents}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Tidak Aktif: {Math.max(0, totalStudents - activeStudents)}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart - Students Per Course */}
      {barChartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Distribusi Pelajar per Kursus (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="student_count" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
                name="Jumlah Pelajar"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
