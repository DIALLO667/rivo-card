import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData, { withCredentials: true });
      const token = response.data.access_token || response.data.token;
      
      if (token) {
        localStorage.setItem('token', token);
        toast.success('Connexion réussie !');
        // On attend 100ms pour être sûr que le token est écrit sur le téléphone
        setTimeout(() => navigate('/dashboard'), 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData, { withCredentials: true });
      const token = response.data.access_token || response.data.token;
      if (token) localStorage.setItem('token', token);
      toast.success('Compte créé !');
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Helmet><title>Connexion | Rivo Card</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#0B1220]">RIVO<span className="text-blue-600">-CARD</span></h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase mt-2">Espace administrateur</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-[#0B1220] data-[state=active]:text-white">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-[#0B1220] data-[state=active]:text-white">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input type="email" placeholder="Email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="bg-white border-gray-200 h-12 rounded-xl text-gray-900 focus-visible:ring-blue-600" />
                <Input type="password" placeholder="Mot de passe" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="bg-white border-gray-200 h-12 rounded-xl text-gray-900 focus-visible:ring-blue-600" />
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input placeholder="Nom" required value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} className="bg-white border-gray-200 h-12 rounded-xl text-gray-900 focus-visible:ring-blue-600" />
                <Input type="email" placeholder="Email" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="bg-white border-gray-200 h-12 rounded-xl text-gray-900 focus-visible:ring-blue-600" />
                <Input type="password" placeholder="Mot de passe" required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="bg-white border-gray-200 h-12 rounded-xl text-gray-900 focus-visible:ring-blue-600" />
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl">
                  {loading ? 'Inscription...' : 'Créer un compte'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}