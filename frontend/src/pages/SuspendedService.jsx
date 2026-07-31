import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function SuspendedService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Helmet><title>Service suspendu | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="text-center max-w-md">
        <div className="glass-card rounded-3xl p-12 backdrop-blur-2xl">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold text-white mb-4">
            Service Suspendu
          </h1>
          <p className="text-gray-300 mb-8">
            Ce profil n'est actuellement pas disponible. Veuillez contacter l'administrateur pour plus d'informations.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}