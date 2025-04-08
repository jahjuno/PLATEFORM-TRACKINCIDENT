import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { IncidentForm } from './components/IncidentForm';
import { Dashboard } from './components/Dashboard';
import { IncidentList } from './components/IncidentList';
import { Auth } from './components/Auth';
import { DatabaseStatus } from './components/DatabaseStatus';
import { useAuth } from './contexts/AuthContext';
import { AlertCircle, BarChart3, LogOut, List } from 'lucide-react';
import SplashAnimation from './components/SplashAnimation';

function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-navy shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Gestion des Incidents
            </h1>
            <div className="flex items-center space-x-4">
              <DatabaseStatus />
              <nav className="space-x-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-primary-yellow"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Tableau de Bord
                </Link>
                <Link
                  to="/incidents"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-primary-yellow"
                >
                  <List className="mr-2 h-5 w-5" />
                  Liste des Incidents
                </Link>
                <Link
                  to="/new-incident"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-primary-yellow"
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Nouvel Incident
                </Link>
                {user && (
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-primary-yellow"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Déconnexion
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
      </div>
    );
  }

  return (
    <>
      {showSplash && <SplashAnimation />}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/incidents"
            element={
              <Layout>
                <IncidentList />
              </Layout>
            }
          />
          <Route
            path="/new-incident"
            element={
              <Layout>
                <IncidentForm />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Auth />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;