import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import './VitalsChart.css';

const data = [
    { date: 'Jan', systolic: 120, diastolic: 80, heartRate: 72 },
    { date: 'Feb', systolic: 118, diastolic: 78, heartRate: 75 },
    { date: 'Mar', systolic: 122, diastolic: 82, heartRate: 71 },
    { date: 'Apr', systolic: 119, diastolic: 79, heartRate: 73 },
    { date: 'May', systolic: 125, diastolic: 85, heartRate: 78 },
    { date: 'Jun', systolic: 121, diastolic: 81, heartRate: 74 },
];



const VitalsChart = () => {
    return (
        <div className="vc-container">
            <h3 className="vc-title">Health Trends</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e5e7eb)" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted, #9ca3af)"
                            tick={{ fill: 'var(--text-muted, #9ca3af)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="var(--text-muted, #9ca3af)"
                            tick={{ fill: 'var(--text-muted, #9ca3af)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card, #fff)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #e2e8f0)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: 'var(--text-primary, #1e293b)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="systolic"
                            stroke="#ef4444"
                            strokeWidth={3}
                            name="Systolic BP"
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="diastolic"
                            stroke="#f97316"
                            strokeWidth={3}
                            name="Diastolic BP"
                            dot={{ r: 4, strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="heartRate"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            name="Heart Rate"
                            dot={{ r: 4, strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default VitalsChart;
