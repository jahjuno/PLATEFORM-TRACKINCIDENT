import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle2, XCircle, ChevronRight, Maximize2, Minimize2, X, Save, Edit } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import type { Incident } from '../types/incident';

const PRIORITY_COLORS = {
  P0: 'bg-primary-red text-white',
  P1: 'bg-red-400 text-white',
  P2: 'bg-primary-yellow text-primary-navy',
  P3: 'bg-primary-navy text-white',
  P4: 'bg-gray-500 text-white'
};

const STATUS_ICONS = {
  NEW: <AlertCircle className="h-5 w-5" />,
  IN_PROGRESS: <Clock className="h-5 w-5" />,
  RESOLVED: <CheckCircle2 className="h-5 w-5" />,
  CLOSED: <XCircle className="h-5 w-5" />
};

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Nouveau' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolu' }
];

const STATUS_COLORS = {
  NEW: 'bg-primary-red text-white',
  IN_PROGRESS: 'bg-primary-yellow text-primary-navy',
  RESOLVED: 'bg-green-500 text-white',
  CLOSED: 'bg-gray-500 text-white'
};

const IncidentItem = ({ incident, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
      isSelected ? 'bg-gray-100' : ''
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${STATUS_COLORS[incident.status]} text-white`}>
          {STATUS_ICONS[incident.status]}
        </div>
        <div>
          <h3 className="font-medium text-primary-navy">{incident.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')}</span>
            <span>•</span>
            <span>{incident.ticket_number}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[incident.priority]}`}>
          {incident.priority}
        </span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

const StatusDropdown = ({ status, isOpen, onToggle, onChange, dropdownRef }) => (
  <div ref={dropdownRef} className="relative">
    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`mt-1 cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_OPTIONS.find(option => option.value === status)?.label || status}
    </div>
    
    {isOpen && (
      <div className="absolute z-50 mt-1 w-40 bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
              status === option.value ? 'bg-gray-100' : ''
            }`}
            disabled={option.value === 'NEW'}
            style={option.value === 'NEW' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={(e) => {
              e.stopPropagation();
              if (option.value !== 'NEW') {
                onChange(option.value);
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

const DetailField = ({ label, value, className = "" }) => (
  <div className={className}>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-gray-700">{value || '-'}</p>
  </div>
);

// Nouveau composant pour un champ modifiable
const EditableField = ({ label, value, isEditing, onEdit, onChange, onSave, className = "" }) => (
  <div className={className}>
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      {isEditing ? (
        <button 
          onClick={onSave}
          className="text-primary-navy hover:text-primary-yellow transition-colors p-1 rounded"
        >
          <Save className="h-4 w-4" />
        </button>
      ) : (
        <button 
          onClick={onEdit}
          className="text-primary-navy hover:text-primary-yellow transition-colors p-1 rounded"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
    </div>
    {isEditing ? (
      <textarea
        value={value || ''}
        onChange={onChange}
        className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
        rows={4}
        placeholder={`Saisir ${label.toLowerCase()}...`}
      />
    ) : (
      <p className="mt-1 text-gray-700">{value || '-'}</p>
    )}
  </div>
);

const TimelineItem = ({ label, value, formatter = null }) => (
  <div>
    <span className="text-xs text-gray-500">{label}:</span>
    <p className="text-sm text-gray-700">
      {value ? (formatter ? formatter(value) : value) : 'Non spécifié'}
    </p>
  </div>
);

export function IncidentList() {
  const { incidents: initialIncidents, loading, error, updateIncident } = useIncidents();
  const [incidents, setIncidents] = useState(initialIncidents || []);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // États pour les champs éditables
  const [isEditingRootCause, setIsEditingRootCause] = useState(false);
  const [isEditingSolution, setIsEditingSolution] = useState(false);
  const [editedRootCause, setEditedRootCause] = useState('');
  const [editedSolution, setEditedSolution] = useState('');
  
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    if (initialIncidents) {
      setIncidents(initialIncidents);
    }
  }, [initialIncidents]);

  useEffect(() => {
    if (selectedIncident) {
      const updatedIncident = incidents.find(inc => inc.id === selectedIncident.id);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
        // Mettre à jour les valeurs éditées avec les valeurs actuelles
        setEditedRootCause(updatedIncident.root_cause || '');
        setEditedSolution(updatedIncident.solution_provided || '');
      }
    }
  }, [incidents, selectedIncident]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => {
        setUpdateError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident || isUpdating) return;
    
    if (newStatus === 'NEW' || selectedIncident.status === newStatus) {
      setIsStatusDropdownOpen(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const updateData = { 
        status: newStatus,
        resolved_at: newStatus === 'RESOLVED' ? new Date().toISOString() : null
      };
      
      const optimisticIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id ? { ...inc, ...updateData } : inc
      );
      setIncidents(optimisticIncidents);
      setSelectedIncident(prev => ({ ...prev, ...updateData }));
      
      const result = await updateIncident(selectedIncident.id, updateData);
      
      if (!result || (result && result.status !== newStatus)) {
        throw new Error("La mise à jour n'a pas été appliquée correctement");
      }
      
      setIsStatusDropdownOpen(false);
    } catch (error) {
      console.error("Échec de la mise à jour du statut de l'incident:", error);
      
      const originalIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id 
          ? { ...inc, status: selectedIncident.status } 
          : inc
      );
      setIncidents(originalIncidents);
      
      const originalIncident = incidents.find(inc => inc.id === selectedIncident.id);
      if (originalIncident) {
        setSelectedIncident(originalIncident);
      }
      
      const errorDetails = error.message || "Échec de la mise à jour du statut. Veuillez réessayer.";
      setUpdateError(errorDetails);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction pour gérer la sauvegarde de la cause racine
  const handleSaveRootCause = async () => {
    if (!selectedIncident || isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      const updateData = { 
        root_cause: editedRootCause
      };
      
      const optimisticIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id ? { ...inc, ...updateData } : inc
      );
      setIncidents(optimisticIncidents);
      setSelectedIncident(prev => ({ ...prev, ...updateData }));
      
      const result = await updateIncident(selectedIncident.id, updateData);
      
      if (!result || (result && result.root_cause !== editedRootCause)) {
        throw new Error("La mise à jour de la cause racine n'a pas été appliquée correctement");
      }
      
      setIsEditingRootCause(false);
    } catch (error) {
      console.error("Échec de la mise à jour de la cause racine:", error);
      
      const originalIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id 
          ? { ...inc, root_cause: selectedIncident.root_cause } 
          : inc
      );
      setIncidents(originalIncidents);
      
      const originalIncident = incidents.find(inc => inc.id === selectedIncident.id);
      if (originalIncident) {
        setSelectedIncident(originalIncident);
        setEditedRootCause(originalIncident.root_cause || '');
      }
      
      const errorDetails = error.message || "Échec de la mise à jour de la cause racine. Veuillez réessayer.";
      setUpdateError(errorDetails);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction pour gérer la sauvegarde de la solution apportée
  const handleSaveSolution = async () => {
    if (!selectedIncident || isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      const updateData = { 
        solution_provided: editedSolution
      };
      
      const optimisticIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id ? { ...inc, ...updateData } : inc
      );
      setIncidents(optimisticIncidents);
      setSelectedIncident(prev => ({ ...prev, ...updateData }));
      
      const result = await updateIncident(selectedIncident.id, updateData);
      
      if (!result || (result && result.solution_provided !== editedSolution)) {
        throw new Error("La mise à jour de la solution apportée n'a pas été appliquée correctement");
      }
      
      setIsEditingSolution(false);
    } catch (error) {
      console.error("Échec de la mise à jour de la solution apportée:", error);
      
      const originalIncidents = incidents.map(inc => 
        inc.id === selectedIncident.id 
          ? { ...inc, solution_provided: selectedIncident.solution_provided } 
          : inc
      );
      setIncidents(originalIncidents);
      
      const originalIncident = incidents.find(inc => inc.id === selectedIncident.id);
      if (originalIncident) {
        setSelectedIncident(originalIncident);
        setEditedSolution(originalIncident.solution_provided || '');
      }
      
      const errorDetails = error.message || "Échec de la mise à jour de la solution apportée. Veuillez réessayer.";
      setUpdateError(errorDetails);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedIncident(null);
    setIsMaximized(false);
    setIsEditingRootCause(false);
    setIsEditingSolution(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-primary-red">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium">Erreur lors du chargement des incidents</h3>
        <p className="text-sm">{error.message || "Veuillez réessayer ultérieurement"}</p>
      </div>
    );
  }

  const calculateDuration = (start, end) => {
    if (!start) return 'Non spécifié';
    if (!end) return 'En cours';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.abs(endDate - startDate) / 1000;
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {updateError && (
        <div className="absolute top-4 right-4 bg-primary-red text-white p-3 rounded-lg shadow-lg z-50 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{updateError}</span>
          <button 
            className="ml-3" 
            onClick={() => setUpdateError(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-navy mr-3"></div>
            <span>Mise à jour en cours...</span>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${selectedIncident && !isMaximized ? 'w-1/3' : 'w-full'} flex flex-col`}>
        <div className="bg-primary-navy text-white p-3 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-semibold">Liste des Incidents</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{incidents.length} incident{incidents.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <IncidentItem 
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onClick={() => setSelectedIncident(incident)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>Aucun incident à afficher</p>
            </div>
          )}
        </div>
      </div>

      {selectedIncident && (
        <div className={`${isMaximized ? 'w-full absolute inset-0 z-10' : 'w-2/3'} bg-white rounded-lg shadow-lg ml-4 transition-all duration-300`}>
          <div className="bg-primary-navy text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">Détails de l'Incident</h2>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {selectedIncident.ticket_number}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1 hover:text-primary-yellow transition-colors"
              >
                {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              <button
                onClick={handleCloseDetails}
                className="p-1 hover:text-primary-yellow transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 56px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DetailField 
                  label="Titre" 
                  value={selectedIncident.title}
                  className="text-lg font-medium text-primary-navy"
                />
                <DetailField label="Description" value={selectedIncident.description} />
                <DetailField label="Plateforme" value={selectedIncident.platform} />
                <DetailField label="Business Impacté" value={selectedIncident.impacted_business} />
                <DetailField label="Localisation" value={selectedIncident.location} />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <StatusDropdown 
                    status={selectedIncident.status}
                    isOpen={isStatusDropdownOpen}
                    onToggle={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    onChange={handleStatusChange}
                    dropdownRef={statusDropdownRef}
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priorité</h3>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${PRIORITY_COLORS[selectedIncident.priority]}`}>
                      {selectedIncident.priority}
                    </span>
                  </div>
                </div>
                <EditableField 
                  label="Cause Racine" 
                  value={editedRootCause}
                  isEditing={isEditingRootCause}
                  onEdit={() => setIsEditingRootCause(true)}
                  onChange={(e) => setEditedRootCause(e.target.value)}
                  onSave={handleSaveRootCause}
                />
                <EditableField 
                  label="Solution Apportée" 
                  value={editedSolution}
                  isEditing={isEditingSolution}
                  onEdit={() => setIsEditingSolution(true)}
                  onChange={(e) => setEditedSolution(e.target.value)}
                  onSave={handleSaveSolution}
                />
                <DetailField label="Catégorie du Problème" value={selectedIncident.problem_category} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Chronologie</h3>
                <div className="mt-2 space-y-3">
                  <TimelineItem 
                    label="Début" 
                    value={selectedIncident.incident_start_time}
                    formatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
                  />
                  <TimelineItem 
                    label="Fin" 
                    value={selectedIncident.incident_end_time}
                    formatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
                  />
                  <TimelineItem 
                    label="Durée" 
                    value={calculateDuration(
                      selectedIncident.incident_start_time, 
                      selectedIncident.incident_end_time
                    )}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Intervenants</h3>
                <div className="mt-2 space-y-3">
                  <TimelineItem label="Personne Intervenante" value={selectedIncident.intervening_person} />
                  <TimelineItem label="Email de l'Équipe" value={selectedIncident.intervening_team_email} />
                  <TimelineItem label="Équipe Responsable" value={selectedIncident.responsible_team} />
                  <TimelineItem label="Personne Assignée" value={selectedIncident.assigned_person} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Analyse RCA</h3>
              <div className="mt-2">
                <DetailField 
                  label="Destinataires RCA" 
                  value={selectedIncident.rca_recipients_emails?.join(', ')} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}