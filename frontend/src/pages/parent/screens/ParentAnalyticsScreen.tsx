import React from 'react';
import {
  Wallet
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentAnalyticsScreen: React.FC = () => {
  const {
    parentLinkedStudent,
    parentMetrics,
    parentCategoryChartData,
    highestSpendCategory,
    parentMonthlyChartData,
    parentDailyTrendData,
  } = useCampusKart();

  return (
            <div className="space-y-6">
              {/* 5 Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-stone-500">Total Expenditure</span>
                  <p className="text-xl font-black text-[#2C1A12] mt-1">₹{parentMetrics.totalSpent}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-stone-500">Avg Transaction</span>
                  <p className="text-xl font-black text-cyan-700 mt-1">₹{parentMetrics.avgPurchase}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-stone-500">Number of Purchases</span>
                  <p className="text-xl font-black text-orange-600 mt-1">{parentMetrics.purchaseCount} Orders</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-stone-500">Highest Spend Category</span>
                  <p className="text-base font-extrabold text-orange-600 mt-1 truncate">{highestSpendCategory}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-[11px] text-stone-500">Remaining Wallet Balance</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">₹{parentLinkedStudent.walletBalance}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#2C1A12] mb-3">1. Category Distribution (Pie Chart)</h3>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={parentCategoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, value }) => `${name}: ₹${value}`}
                        >
                          {parentCategoryChartData.map((_, i) => (
                            <Cell key={i} fill={['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#2C1A12] mb-3">2. Monthly Funding vs. Spending (Bar Chart)</h3>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={parentMonthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D6" />
                        <XAxis dataKey="month" stroke="#6F4E37" fontSize={11} />
                        <YAxis stroke="#6F4E37" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="funded" name="Wallet Funded (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="spent" name="Total Spent (₹)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#2C1A12] mb-3">3. Daily Spending & Top-Up Trend (Line Chart)</h3>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parentDailyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D6" />
                        <XAxis dataKey="day" stroke="#6F4E37" fontSize={11} />
                        <YAxis stroke="#6F4E37" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="amount" name="Daily Spend (₹)" stroke="#f59e0b" strokeWidth={3} />
                        <Line type="monotone" dataKey="funded" name="Wallet Funded (₹)" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

  );
};

export default ParentAnalyticsScreen;
