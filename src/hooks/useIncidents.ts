import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Incident } from '../types/incident';

export interface IncidentStats {
  totalIncidents: number;
  criticalIncidents: number;
  mttr: number;
  resolutionRate: number;
  priorityDistribution: { priority: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  teamStats: {
    name: string;
    mttr: number;
    incidents: number;
    resolutionRate: number;
  }[];
  recentIncidents: Incident[];
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
    const subscription = supabase
      .channel('incidents_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'incidents' 
      }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchIncidents() {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
      calculateStats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(incidents: Incident[]) {
    if (!incidents.length) {
      setStats({
        totalIncidents: 0,
        criticalIncidents: 0,
        mttr: 0,
        resolutionRate: 0,
        priorityDistribution: [],
        statusDistribution: [],
        teamStats: [],
        recentIncidents: []
      });
      return;
    }

    const criticalIncidents = incidents.filter(i => i.priority === 'P0' && i.status !== 'CLOSED').length;
    
    const resolvedIncidents = incidents.filter(i => i.resolved_at);
    const totalResolutionTime = resolvedIncidents.reduce((acc, inc) => {
      const resolutionTime = new Date(inc.resolved_at!).getTime() - new Date(inc.created_at).getTime();
      return acc + resolutionTime;
    }, 0);
    const mttr = resolvedIncidents.length ? (totalResolutionTime / resolvedIncidents.length) / (1000 * 60 * 60) : 0;

    const resolutionRate = incidents.length ? (resolvedIncidents.length / incidents.length) * 100 : 0;

    const priorityDistribution = ['P0', 'P1', 'P2', 'P3', 'P4'].map(priority => ({
      priority,
      count: incidents.filter(i => i.priority === priority).length
    }));

    const statusDistribution = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => ({
      status,
      count: incidents.filter(i => i.status === status).length
    }));

    const teams = [...new Set(incidents.map(i => i.intervening_team))];
    const teamStats = teams.map(team => {
      const teamIncidents = incidents.filter(i => i.intervening_team === team);
      const resolvedTeamIncidents = teamIncidents.filter(i => i.resolved_at);
      const teamMttr = resolvedTeamIncidents.length ? 
        resolvedTeamIncidents.reduce((acc, inc) => {
          const resolutionTime = new Date(inc.resolved_at!).getTime() - new Date(inc.created_at).getTime();
          return acc + resolutionTime;
        }, 0) / (resolvedTeamIncidents.length * 1000 * 60 * 60) : 0;

      return {
        name: team,
        mttr: teamMttr,
        incidents: teamIncidents.length,
        resolutionRate: teamIncidents.length ? (resolvedTeamIncidents.length / teamIncidents.length) * 100 : 0
      };
    });

    const recentIncidents = incidents.slice(0, 5);

    setStats({
      totalIncidents: incidents.length,
      criticalIncidents,
      mttr,
      resolutionRate,
      priorityDistribution,
      statusDistribution,
      teamStats,
      recentIncidents
    });
  }

  async function createIncident(incident: Omit<Incident, 'id' | 'created_at' | 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert([incident])
        .select()
        .single();

      if (error) throw error;

      setIncidents(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }

  async function updateIncident(id: string, updates: Partial<Incident>) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIncidents(prev => prev.map(incident => 
        incident.id === id ? { ...incident, ...data } : incident
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }

  return {
    incidents,
    stats,
    loading,
    error,
    createIncident,
    updateIncident,
    refreshIncidents: fetchIncidents
  };
}