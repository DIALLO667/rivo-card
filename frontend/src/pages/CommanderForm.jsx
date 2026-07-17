import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, ArrowLeft, MessageCircle } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "";

const OFFERS = [
  { value: "medium", label: "Carte NFC Medium — 10 000 F" },
  { value: "premium", label: "Carte NFC Premium — 15 000 F" },
  { value: "pme-starter", label: "PME Pack Starter" },
  { value: "pme-business", label: "PME Pack Business" },
  { value: "pme-premium", label: "PME Pack Premium" },
  { value: "autre", label: "Autre / je ne sais pas encore" },
];

const WHATSAPP_PHONE = "+221785207689";

export default function CommanderForm() {
  const [searchParams] = useSearchParams();
  const initialOffer = searchParams.get("offer") || "";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    offer: OFFERS.some((o) => o.value === initialOffer) ? initialOffer : "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Le nom et le numéro de téléphone sont obligatoires.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      if (form.email.trim()) fd.append("email", form.email.trim());
      if (form.company.trim()) fd.append("company", form.company.trim());
      if (form.offer) fd.append("offer", form.offer);
      if (form.message.trim()) fd.append("message", form.message.trim());
      await axios.post(`${API}/orders`, fd);
      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Une erreur est survenue. Merci de réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="landing-page min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Commande enregistrée</h1>
          <p className="text-muted-foreground">
            Merci {form.name.split(" ")[0] || ""} ! Nous avons bien reçu votre demande.
            Notre équipe vous contacte très vite pour finaliser le paiement et la mise en service de votre carte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={`https://api.whatsapp.com/send/?phone=%2B${WHATSAPP_PHONE.replace(/\D/g, "")}&text=${encodeURIComponent(
                `Bonjour, je viens de passer une commande RIVO-CARD (${form.name}).`
              )}&type=phone_number&app_absent=0`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-[hsl(142,70%,45%)] text-white hover:bg-[hsl(142,70%,40%)] px-6 py-3 rounded-full font-medium inline-flex items-center gap-2 transition-colors">
                <MessageCircle className="h-4 w-4" />
                Nous écrire sur WhatsApp
              </button>
            </a>
            <Link to="/">
              <button className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-3 rounded-full font-medium transition-colors w-full">
                Retour à l&apos;accueil
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen bg-background text-foreground px-4 py-12 md:py-20">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="space-y-2 mb-8">
          <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            COMMANDER MA CARTE
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">
            Finalisez votre <span className="text-primary">commande</span>
          </h1>
          <p className="text-muted-foreground">
            Remplissez ce formulaire, notre équipe vous recontacte pour confirmer le paiement et activer votre carte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6 md:p-8">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="name">Nom complet *</label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Ex : Amadou Diallo"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="phone">Téléphone (WhatsApp) *</label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={update("phone")}
              placeholder="Ex : 77 123 45 67"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="vous@exemple.com"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="company">Entreprise (si pack PME)</label>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={update("company")}
              placeholder="Nom de votre entreprise"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="offer">Offre souhaitée</label>
            <select
              id="offer"
              value={form.offer}
              onChange={update("offer")}
              className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Sélectionnez une offre</option>
              {OFFERS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="message">Précisions (optionnel)</label>
            <textarea
              id="message"
              rows={3}
              value={form.message}
              onChange={update("message")}
              placeholder="Nombre de cartes, personnalisation souhaitée..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 px-6 py-3.5 rounded-full font-semibold transition-colors"
          >
            {submitting ? "Envoi en cours..." : "Envoyer ma commande"}
          </button>
        </form>
      </div>
    </div>
  );
}
