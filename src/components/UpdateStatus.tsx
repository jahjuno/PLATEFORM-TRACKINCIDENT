// src/components/UpdateStatus.tsx

import React, { useState } from 'react';

// Définir les statuts disponibles
const STATUSES = ['open', 'in_progress', 'closed'];

interface UpdateStatusProps {
  incidentId: string;
  initialStatus: string;
  onUpdateStatus: (incidentId: string, newStatus: string) => void;
}

const UpdateStatus: React.FC<UpdateStatusProps> = ({ incidentId, initialStatus, onUpdateStatus }) => {
  const [status, setStatus] = useState(initialStatus);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    onUpdateStatus(incidentId, newStatus);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800">Modifier le statut de l'incident</h3>
      <div className="mt-4">
        <label htmlFor="status" className="text-sm font-medium text-gray-600">Statut de l'incident</label>
        <select
          id="status"
          value={status}
          onChange={handleStatusChange}
          className="mt-2 p-2 border border-gray-300 rounded w-full"
        >
          {STATUSES.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UpdateStatus;
