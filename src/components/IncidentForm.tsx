import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../hooks/useIncidents';
import type { Priority, Status } from '../types/incident';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Service d'envoi d'email
const sendEmail = async (data: any) => {
  try {
    // Création du contenu de l'email avec les données de l'incident
    const emailContent = `
      <h1>Nouvel incident: ${data.title}</h1>
      <p><strong>Numéro de ticket:</strong> ${data.ticket_number}</p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p><strong>Plateforme:</strong> ${data.platform}</p>
      <p><strong>Business impacté:</strong> ${data.impacted_business}</p>
      <p><strong>Priorité:</strong> ${data.priority}</p>
      <p><strong>Statut:</strong> ${data.status}</p>
      <p><strong>Équipe responsable:</strong> ${data.responsible_team}</p>
      <p><strong>Catégorie du problème:</strong> ${data.problem_category}</p>
      
      <h2>Informations temporelles (non modifiables)</h2>
      <p><strong>Date et heure de début:</strong> ${data.incident_start_time}</p>
      <p><strong>Date et heure de fin:</strong> ${data.incident_end_time}</p>
      <p><strong>Durée de l'incident:</strong> ${data.duration}</p>
      
      <h2>Sections à compléter</h2>
      <p><strong>Cause racine:</strong> ${data.root_cause || 'À remplir par l\'équipe intervenante'}</p>
      <p><strong>Solution apportée:</strong> ${data.solution_provided || 'À remplir par l\'équipe intervenante'}</p>
      <p><strong>Localisation:</strong> ${data.localisation || 'À remplir par l\'équipe intervenante'}</p>
    `;

    // Utilisation d'une API REST pour l'envoi d'email (exemple avec EmailJS ou autre service)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'incident-management@company.com',
        to: data.rca_recipients_emails,
        cc: [data.intervening_person_email, data.responsible_team_email],
        subject: `Nouvel incident: ${data.ticket_number} - ${data.title}`,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    throw error;
  }
};

const priorities: Priority[] = ['P0', 'P1', 'P2', 'P3', 'P4'];
const statuses: Status[] = ['Nouveau', 'En Attente Fichier RCA'];
const problemCategories: string[] = [
  'Infrastructure', 
  'Application', 
  'Network', 
  'Security', 
  'Performance', 
  'Integration', 
  'Data'
];

const PRIORITY_DESCRIPTIONS: { [key in Priority]: string } = {
  P0: 'Impact critique sur l\'entreprise - Nécessite une attention immédiate',
  P1: 'Impact majeur sur les utilisateurs - Résolution urgente requise',
  P2: 'Impact modéré - Résolution nécessaire dans les 24h',
  P3: 'Impact mineur - Peut être résolu dans les prochains jours',
  P4: 'Impact minimal - Peut être planifié'
};

// Composant Modal pour la confirmation
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentData: any;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const ConfirmationModal = ({ isOpen, onClose, incidentData, onConfirm, isSubmitting }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-primary-navy">Confirmation de l'incident</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Section des informations générales */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-primary-navy">Informations générales</h3>
            <div className="mt-3 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Numéro de ticket</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.ticket_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priorité</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.priority}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Catégorie du problème</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.problem_category}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-primary-navy">Titre</h3>
            <p className="mt-1 text-sm text-gray-900">{incidentData.title}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-primary-navy">Description</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incidentData.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Plateforme impactée</h3>
              <p className="mt-1 text-sm text-gray-900">{incidentData.platform}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Business impacté</h3>
              <p className="mt-1 text-sm text-gray-900">{incidentData.impacted_business}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-yellow-800">Informations temporelles (non modifiables)</h3>
            <div className="mt-3 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
              <div>
                <p className="text-sm font-medium text-yellow-800">Date et heure de début</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.incident_start_time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Date et heure de fin</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.incident_end_time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Durée</p>
                <p className="mt-1 text-sm text-gray-900">{incidentData.duration}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Personne intervenante</h3>
              <p className="mt-1 text-sm text-gray-900">{incidentData.intervening_person}</p>
              <p className="mt-1 text-sm text-gray-500">{incidentData.intervening_person_email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Équipe responsable</h3>
              <p className="mt-1 text-sm text-gray-900">{incidentData.responsible_team}</p>
              <p className="mt-1 text-sm text-gray-500">{incidentData.responsible_team_email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-primary-navy">Destinataires RCA</h3>
            <p className="mt-1 text-sm text-gray-900">{incidentData.rca_recipients_emails.join(', ')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Cause racine</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incidentData.root_cause || '(À compléter)'}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary-navy">Localisation</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incidentData.localisation || '(À compléter)'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-primary-navy">Solution apportée</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incidentData.solution_provided || '(À compléter)'}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-navy"
          >
            Modifier
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-navy border border-transparent rounded-md shadow-sm hover:bg-primary-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-navy disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Confirmer et envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export function IncidentForm() {
  const navigate = useNavigate();
  const { createIncident } = useIncidents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('P2');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState<string>('');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [incidentData, setIncidentData] = useState<any>(null);

  // Calcul de la durée et génération du numéro de ticket
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      const year = new Date().getFullYear();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      setTicketNumber(`INC-${year}-${randomNum}`);
      setDuration(`${hours}h ${minutes}m`);
    }
  }, [startDate, endDate]);

  // Fonction de validation de l'email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Préparation des données de l'incident à partir des données du formulaire
  const prepareIncidentData = (formData: FormData) => {
    const intervening_person_email = formData.get('intervening_person_email') as string;
    const responsible_team_email = formData.get('responsible_team_email') as string;
    const rca_recipients_emails = formData.get('rca_recipients_emails') as string;
    
    if (!intervening_person_email || !responsible_team_email) {
      throw new Error('Les emails sont requis');
    }

    // Validation du format de l'email
    if (!validateEmail(intervening_person_email)) {
      throw new Error('Format d\'email invalide pour la personne intervenante');
    }
    
    if (!validateEmail(responsible_team_email)) {
      throw new Error('Format d\'email invalide pour l\'équipe responsable');
    }
    
    const rcaRecipientsEmails = rca_recipients_emails 
      ? rca_recipients_emails.split(',').map(email => email.trim()) 
      : [];
    
    rcaRecipientsEmails.forEach(email => {
      if (!validateEmail(email)) {
        throw new Error('Format d\'email invalide pour les destinataires RCA');
      }
    });

    // Création de l'objet incident
    return {
      id: uuidv4(), // Génère un ID unique
      ticket_number: ticketNumber,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      platform: formData.get('platform') as string,
      status: formData.get('status') as Status,
      priority: formData.get('priority') as Priority,
      responsible_team: formData.get('responsible_team') as string,
      responsible_team_email,
      impacted_business: formData.get('impacted_business') as string,
      root_cause: formData.get('root_cause') as string,
      solution_provided: formData.get('solution_provided') as string,
      incident_start_time: formData.get('incident_start_time') as string,
      incident_end_time: formData.get('incident_end_time') as string,
      intervening_person: formData.get('intervening_person') as string,
      intervening_person_email,
      problem_category: formData.get('problem_category') as string,
      rca_recipients_emails: rcaRecipientsEmails,
      localisation: formData.get('localisation') as string,
      duration: duration
    };
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = prepareIncidentData(formData);
      setIncidentData(data);
      // Ouvrir le modal de confirmation au lieu d'envoyer immédiatement
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Gestion de la confirmation et de l'envoi définitif
  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Enregistrement de l'incident dans la base de données
      await createIncident(incidentData);
      
      // Envoi de l'email avec les informations de l'incident
      await sendEmail(incidentData);
      setEmailSent(true);
      
      // Fermer le modal
      setShowConfirmation(false);
      
      // Redirection vers la page d'accueil
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {error && (
          <div className="bg-primary-red bg-opacity-10 border-l-4 border-primary-red p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-primary-red" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-primary-red">{error}</p>
              </div>
            </div>
          </div>
        )}

        {emailSent && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Email envoyé avec succès !</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-primary-navy">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-primary-navy">
                Titre de l'incident
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                required
                placeholder="Ex: Panne du service d'authentification"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-primary-navy">
                Description détaillée
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                required
                placeholder="Décrivez l'incident, son impact et les symptômes observés..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-primary-navy">
                  Plateforme impactée
                </label>
                <input
                  type="text"
                  name="platform"
                  id="platform"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: Production API"
                />
              </div>

              <div>
                <label htmlFor="impacted_business" className="block text-sm font-medium text-primary-navy">
                  Business impacté
                </label>
                <input
                  type="text"
                  name="impacted_business"
                  id="impacted_business"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: Service Client"
                />
              </div>
            </div>
<div>
  <label htmlFor="localisation" className="block text-sm font-medium text-primary-navy">
    Localisation
  </label>
  <div className="mt-1">
    <input
      type="text"
      name="localisation"
      id="localisation"
               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                placeholder=" lieu de l'incident"
    />
  </div>
</div>

            <div>
              <label htmlFor="root_cause" className="block text-sm font-medium text-primary-navy">
                Cause racine
              </label>
              <textarea
                id="root_cause"
                name="root_cause"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                placeholder="À remplir par l'équipe intervenante..."
              />
            </div>

            <div>
              <label htmlFor="solution_provided" className="block text-sm font-medium text-primary-navy">
                Solution apportée
              </label>
              <textarea
                id="solution_provided"
                name="solution_provided"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                placeholder="À remplir par l'équipe intervenante..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="incident_start_time" className="block text-sm font-medium text-primary-navy">
                  Date et heure de début
                </label>
                <input
                  type="datetime-local"
                  name="incident_start_time"
                  id="incident_start_time"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="incident_end_time" className="block text-sm font-medium text-primary-navy">
                  Date et heure de fin
                </label>
                <input
                  type="datetime-local"
                  name="incident_end_time"
                  id="incident_end_time"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {duration && (
              <div>
                <label className="block text-sm font-medium text-primary-navy">
                  Durée de l'incident
                </label>
                <p className="mt-1 text-sm text-gray-600">{duration}</p>
                <input type="hidden" name="duration" value={duration} />
              </div>
            )}

            {/* Section pour les intervenants et l'équipe responsable */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="intervening_person" className="block text-sm font-medium text-primary-navy">
                  Personne intervenante
                </label>
                <input
                  type="text"
                  name="intervening_person"
                  id="intervening_person"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: John Doe"
                />
              </div>

              <div>
                <label htmlFor="intervening_person_email" className="block text-sm font-medium text-primary-navy">
                  Email de la personne intervenante
                </label>
                <input
                  type="email"
                  name="intervening_person_email"
                  id="intervening_person_email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: john.doe@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="responsible_team" className="block text-sm font-medium text-primary-navy">
                  Équipe responsable
                </label>
                <input
                  type="text"
                  name="responsible_team"
                  id="responsible_team"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: DevOps Team"
                />
              </div>

              <div>
                <label htmlFor="responsible_team_email" className="block text-sm font-medium text-primary-navy">
                  Email Équipe responsable
                </label>
                <input
                  type="email"
                  name="responsible_team_email"
                  id="responsible_team_email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  placeholder="Ex: devops@company.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="rca_recipients_emails" className="block text-sm font-medium text-primary-navy">
                Destinataires RCA (emails séparés par des virgules)
              </label>
              <input
                type="text"
                name="rca_recipients_emails"
                id="rca_recipients_emails"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                placeholder="Ex: manager@company.com, director@company.com"
              />
              <p className="mt-1 text-xs text-gray-500">Liste des emails qui recevront le rapport d'incident</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-primary-navy">
                  Priorité
                </label>
                <select
                  name="priority"
                  id="priority"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                >
                  {priorities.map(priority => (
                    <option 
                      key={priority} 
                      value={priority}
                      className={priority === 'P0' ? 'bg-red-50 text-red-700 font-semibold' : ''}
                    >
                      {priority === 'P0' ? `${priority} - CRITIQUE` : priority}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {PRIORITY_DESCRIPTIONS[selectedPriority]}
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-primary-navy">
                  Statut
                </label>
                <select
                  name="status"
                  id="status"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  required
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="problem_category" className="block text-sm font-medium text-primary-navy">
                Catégorie du problème
              </label>
              <select
                name="problem_category"
                id="problem_category"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-navy focus:outline-none focus:ring-1 focus:ring-primary-navy"
                required
              >
                {problemCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Affichage du numéro de ticket généré */}
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <label className="block text-sm font-medium text-primary-navy">
            Numéro de ticket SN
          </label>
          <p className="mt-1 text-sm text-gray-900">{ticketNumber}</p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-semibold text-white bg-primary-navy rounded-md shadow hover:bg-primary-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-navy disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Valider l\'incident'}
          </button>
        </div>
      </form>

      {/* Affichage du modal de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        incidentData={incidentData}
        onConfirm={handleConfirmSubmit}
        isSubmitting={loading}
      />
    </>
  );
}
