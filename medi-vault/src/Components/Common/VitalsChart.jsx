import React, { useState } from 'react';
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
import { Plus, X, Activity } from 'lucide-react';
import './VitalsChart.css';

const DEMO_DATA = [
    { date: 'Jan', systolic: 120, diastolic: 80, heartRate: 72 },
    { date: 'Feb', systolic: 118, diastolic: 78, heartRate: 75 },
    { date: 'Mar', systolic: 122, diastolic: 82, heartRate: 71 },
    { date: 'Apr', systolic: 119, diastolic: 79, heartRate: 73 },
    { date: 'May', systolic: 125, diastolic: 85, heartRate: 78 },
    { date: 'Jun', systolic: 121, diastolic: 81, heartRate: 74 },
];

const EMPTY_FORM = { date: '', systolic: '', diastolic: '', heartRate: '' };

const VitalsChart = ({ vitalsData, onAddVital }) => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const data = (vitalsData && vitalsData.length > 0) ? vitalsData : DEMO_DATA;
    const isDemo = !vitalsData || vitalsData.length === 0;

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.date || !form.systolic || !form.diastolic || !form.heartRate) return;
        setSaving(true);
        const entry = {
            date: form.date,
            systolic: Number(form.systolic),
            diastolic: Number(form.diastolic),
            heartRate: Number(form.heartRate),
        };
        if (onAddVital) {
            try { await onAddVital(entry); } catch (_) { /* handled by parent */ }
        }
        setSaving(false);
        setShowModal(false);
        setForm(EMPTY_FORM);
    };

    return (
        <>
            <div className="vc-container">
                <div className="vc-header">
                    <div>
                        <h3 className="vc-title">Health Trends</h3>
                        {isDemo && <p className="vc-demo-note">Showing sample data — log your vitals to track real trends</p>}
                    </div>
                    <button className="vc-log-btn" onClick={() => setShowModal(true)}>
                        <Plus size={14} /> Log Vitals
                    </button>
                </div>
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

            {/* Log Vitals Modal */}
            {showModal && (
                <div className="vc-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="vc-modal" onClick={e => e.stopPropagation()}>
                        <div className="vc-modal-header">
                            <div className="vc-modal-title-row">
                                <Activity size={18} color="#00d4ff" />
                                <h3>Log Today's Vitals</h3>
                            </div>
                            <button className="vc-modal-close" onClick={() => setShowModal(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="vc-modal-form">
                            <div className="vc-form-row">
                                <div className="vc-field">
                                    <label>Label / Month</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Jul"
                                        value={form.date}
                                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="vc-form-row three-col">
                                <div className="vc-field">
                                    <label>Systolic BP</label>
                                    <input
                                        type="number" required min="60" max="250"
                                        placeholder="120"
                                        value={form.systolic}
                                        onChange={e => setForm(f => ({ ...f, systolic: e.target.value }))}
                                    />
                                </div>
                                <div className="vc-field">
                                    <label>Diastolic BP</label>
                                    <input
                                        type="number" required min="40" max="180"
                                        placeholder="80"
                                        value={form.diastolic}
                                        onChange={e => setForm(f => ({ ...f, diastolic: e.target.value }))}
                                    />
                                </div>
                                <div className="vc-field">
                                    <label>Heart Rate</label>
                                    <input
                                        type="number" required min="30" max="250"
                                        placeholder="72"
                                        value={form.heartRate}
                                        onChange={e => setForm(f => ({ ...f, heartRate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="vc-modal-submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Vitals'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default VitalsChart;
