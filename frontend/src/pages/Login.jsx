import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f1113] p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F5E0A3]">JPM</h1>
          <p className="text-[#D4AF37] text-sm tracking-widest uppercase mt-2">Cartes de visite digitales</p>
        </div>
        <div className="bg-[#1a1c1e]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/50">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input type="email" placeholder="Email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                <Input type="password" placeholder="Mot de passe" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input placeholder="Nom" required value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                <Input type="email" placeholder="Email" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                <Input type="password" placeholder="Mot de passe" required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold">
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