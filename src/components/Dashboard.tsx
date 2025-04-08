import React, { useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, XCircle, AlertTriangle, Users, Activity, Timer, Shield } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import type { Incident } from '../types/incident';

const COLORS = ['#DC2626', '#1E3A8A', '#FBBF24', '#3B82F6', '#6B7280'];
const PLATFORM_COLORS = {
  'Production': '#2563EB',
  'Development': '#059669',
  'Staging': '#D97706',
  'QA': '#7C3AED',
  'Infrastructure': '#DC2626'
};

const PRIORITY_COLORS = {
  P0: 'bg-primary-red text-white',
  P1: 'bg-red-400 text-white',
  P2: 'bg-primary-yellow text-primary-navy',
  P3: 'bg-primary-navy text-white',
  P4: 'bg-gray-500 text-white'
};

const STATUS_COLORS = {
  NEW: 'bg-primary-red',
  IN_PROGRESS: 'bg-primary-yellow',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-500'
};

const StatCard = ({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  trend?: { value: number; isPositive: boolean } 
}) => (
  <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-navy">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-primary-navy">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-primary-red'}`}>
          <span className="text-sm font-medium">
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        </div>
      )}
    </div>
  </div>
);

export function Dashboard() {
  const { incidents, stats, loading } = useIncidents();
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600">
        No incident data available
      </div>
    );
  }

  const platforms = ['all', ...new Set(incidents.map(incident => incident.platform))];

  const trendData = incidents.reduce((acc, incident) => {
    const date = format(new Date(incident.created_at), 'dd/MM/yyyy');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      if (!existing.platforms[incident.platform]) {
        existing.platforms[incident.platform] = {
          count: 0,
          tickets: []
        };
      }
      existing.platforms[incident.platform].count += 1;
      existing.platforms[incident.platform].tickets.push(incident.ticket_number);
      existing.total += 1;
    } else {
      acc.push({
        date,
        total: 1,
        platforms: {
          [incident.platform]: {
            count: 1,
            tickets: [incident.ticket_number]
          }
        }
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const stackedBarData = trendData.map(item => {
    const data = { date: item.date };
    Object.entries(item.platforms).forEach(([platform, info]) => {
      data[platform] = info.count;
    });
    return data;
  });

  const criticalIncidents = incidents.filter(i => i.priority === 'P0' && i.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-navy">Vue d'ensemble</h2>
        <div className="flex space-x-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-navy focus:outline-none focus:ring-primary-navy sm:text-sm"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'Toutes les plateformes' : platform}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-navy focus:outline-none focus:ring-primary-navy sm:text-sm"
          >
            <option value="24h">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
        </div>
      </div>

      {criticalIncidents.length > 0 && (
        <div className="bg-red-50 border-l-4 border-primary-red p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-primary-red mr-3" />
            <div>
              <h3 className="text-lg font-medium text-primary-red">Incidents Critiques (P0)</h3>
              <p className="text-primary-red">{criticalIncidents.length} incident{criticalIncidents.length > 1 ? 's' : ''} critique{criticalIncidents.length > 1 ? 's' : ''} nécessite{criticalIncidents.length > 1 ? 'nt' : ''} une attention immédiate</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Incidents Critiques"
          value={stats.criticalIncidents}
          icon={AlertTriangle}
          color="bg-primary-red"
          trend={{ value: 50, isPositive: false }}
        />
        <StatCard
          title="MTTR"
          value={`${stats.mttr.toFixed(1)}h`}
          icon={Timer}
          color="bg-primary-navy"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Taux de Résolution"
          value={`${stats.resolutionRate.toFixed(1)}%`}
          icon={CheckCircle2}
          color="bg-green-600"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Incidents"
          value={stats.totalIncidents}
          icon={Activity}
          color="bg-primary-navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-primary-navy mb-4">Distribution par Priorité</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-primary-navy mb-4">Tendance des Incidents par Plateforme</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900">{label}</p>
                          <div className="mt-2 space-y-1">
                            {payload.map((entry, index) => {
                              const platform = entry.dataKey;
                              const count = entry.value;
                              const tickets = trendData
                                .find(item => item.date === label)
                                ?.platforms[platform]?.tickets || [];
                              
                              return (
                                <div 
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: PLATFORM_COLORS[platform] || COLORS[index % COLORS.length] }}
                                  />
                                  <span className="font-medium">{platform}:</span>
                                  <span>{count} incident(s)</span>
                                  <div className="text-xs text-gray-500">
                                    {tickets.join(', ')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {platforms
                  .filter(p => p !== 'all')
                  .map((platform, index) => (
                    <Bar
                      key={platform}
                      dataKey={platform}
                      stackId="platform"
                      fill={PLATFORM_COLORS[platform] || COLORS[index % COLORS.length]}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary-navy">Performance des Équipes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Résolution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.teamStats.map((team) => (
                <tr key={team.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-navy">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.mttr.toFixed(1)}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.incidents}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-navy h-2.5 rounded-full" 
                          style={{ width: `${team.resolutionRate}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{team.resolutionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-primary-navy">Incidents Récents</h3>
        </div>
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {stats.recentIncidents.map((incident) => (
              <li key={incident.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${STATUS_COLORS[incident.status]}`}>
                    {incident.status === 'NEW' && <AlertCircle className="h-6 w-6 text-white" />}
                    {incident.status === 'IN_PROGRESS' && <Clock className="h-6 w-6 text-white" />}
                    {incident.status === 'RESOLVED' && <CheckCircle2 className="h-6 w-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-navy truncate">
                      {incident.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {incident.platform} - {incident.responsible_team}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[incident.priority]}`}>
                      {incident.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}