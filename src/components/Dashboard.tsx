import React, { useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, XCircle, AlertTriangle, Users, Activity, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import { useSpring, animated } from 'react-spring';
import { useNavigate } from 'react-router-dom';
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

const AnimatedStatCard = ({ title, value, icon: Icon, color, trend, onClick }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 20 }
  });

  return (
    <animated.div 
      style={props} 
      className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-navy"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p 
              className="text-2xl font-semibold text-primary-navy cursor-pointer hover:text-primary-navy/80 transition-colors duration-150"
              onClick={onClick}
            >
              {value}
            </p>
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
    </animated.div>
  );
};

const IncidentStatusList = ({ title, incidents, color, icon: Icon, isOpen, onToggle }) => {
  const navigate = useNavigate();
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow animate-fadeIn">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${color} mr-2`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-medium text-primary-navy">{title}</h3>
          <span className="ml-2 text-sm text-gray-500">({incidents.length})</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronUp className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            onClick={() => navigate('/incidents', { state: { selectedIncidentId: incident.id } })}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{incident.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{incident.ticket_number}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[incident.priority]}`}>
                  {incident.priority}
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{incident.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export function Dashboard() {
  const { incidents: allIncidents, stats, loading, error } = useIncidents();
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [openLists, setOpenLists] = useState({
    new: false,
    inProgress: false,
    resolved: false
  });

  const toggleList = (list) => {
    setOpenLists(prev => ({
      ...prev,
      [list]: !prev[list]
    }));
  };

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

  const newIncidents = allIncidents.filter(i => i.status === 'NEW');
  const inProgressIncidents = allIncidents.filter(i => i.status === 'IN_PROGRESS');
  const resolvedIncidents = allIncidents.filter(i => i.status === 'RESOLVED');

  const platforms = ['all', ...new Set(allIncidents.map(incident => incident.platform))];

  const trendData = allIncidents.reduce((acc, incident) => {
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

  const criticalIncidents = allIncidents.filter(i => i.priority === 'P0' && i.status !== 'RESOLVED');

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedStatCard
          title="Nouveaux Incidents"
          value={newIncidents.length}
          icon={AlertCircle}
          color="bg-primary-red"
          trend={{ value: 25, isPositive: false }}
          onClick={() => toggleList('new')}
        />
        <AnimatedStatCard
          title="En Cours"
          value={inProgressIncidents.length}
          icon={Clock}
          color="bg-primary-yellow"
          trend={{ value: 10, isPositive: true }}
          onClick={() => toggleList('inProgress')}
        />
        <AnimatedStatCard
          title="Résolus"
          value={resolvedIncidents.length}
          icon={CheckCircle2}
          color="bg-green-600"
          trend={{ value: 15, isPositive: true }}
          onClick={() => toggleList('resolved')}
        />
      </div>

      {/* Lists that appear only when clicked */}
      {openLists.new && (
        <IncidentStatusList
          title="Nouveaux Incidents"
          incidents={newIncidents}
          color="bg-primary-red"
          icon={AlertCircle}
          isOpen={openLists.new}
          onToggle={() => toggleList('new')}
        />
      )}

      {openLists.inProgress && (
        <IncidentStatusList
          title="En Cours"
          incidents={inProgressIncidents}
          color="bg-primary-yellow"
          icon={Clock}
          isOpen={openLists.inProgress}
          onToggle={() => toggleList('inProgress')}
        />
      )}

      {openLists.resolved && (
        <IncidentStatusList
          title="Résolus"
          incidents={resolvedIncidents}
          color="bg-green-500"
          icon={CheckCircle2}
          isOpen={openLists.resolved}
          onToggle={() => toggleList('resolved')}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatedStatCard
          title="Incidents Critiques"
          value={stats.criticalIncidents}
          icon={AlertTriangle}
          color="bg-primary-red"
          trend={{ value: 50, isPositive: false }}
        />
        <AnimatedStatCard
          title="Taux de Résolution"
          value={`${stats.resolutionRate.toFixed(1)}%`}
          icon={CheckCircle2}
          color="bg-green-600"
          trend={{ value: 5, isPositive: true }}
        />
        <AnimatedStatCard
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
    </div>
  );
}