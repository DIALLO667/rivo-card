import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CheckCircle2, MessageCircle, Camera, X } from "lucide-react";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "";

export const OFFERS = [
  { value: "medium", label: "Carte NFC Medium — 10 000 F" },
  { value: "premium", label: "Carte NFC Premium — 15 000 F" },
  { value: "pme-starter", label: "PME Pack Starter" },
  { value: "pme-business", label: "PME Pack Business" },
  { value: "pme-premium", label: "PME Pack Premium" },
  { value: "autre", label: "Autre / je ne sais pas encore" },
];

export const COUNTRIES = [
  { value: "mali", label: "Mali" },
  { value: "senegal", label: "Sénégal" },
  { value: "burkina-faso", label: "Burkina Faso" },
  { value: "autre", label: "Autre pays" },
];

const WHATSAPP_PHONE = "+221785207689";

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function OrderForm({ initialOffer = "", onSuccess, compact = false }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    country: "mali",
    offer: OFFERS.some((o) => o.value === initialOffer) ? initialOffer : "",
    message: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialOffer && OFFERS.some((o) => o.value === initialOffer)) {
      setForm((f) => ({ ...f, offer: initialOffer }));
    }
  }, [initialOffer]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 10 Mo.");
      return;
    }
    setError("");
    setPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Le nom et le numéro de téléphone sont obligatoires.");
      return;
    }
    if (!form.country) {
      setError("Veuillez indiquer votre pays.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("country", form.country);
      if (form.email.trim()) fd.append("email", form.email.trim());
      if (form.company.trim()) fd.append("company", form.company.trim());
      if (form.offer) fd.append("offer", form.offer);
      if (form.message.trim()) fd.append("message", form.message.trim());
      if (photo) fd.append("photo", photo);
      await axios.post(`${API}/orders`, fd);
      setDone(true);
      onSuccess?.();
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
      <div className={`text-center space-y-5 ${compact ? "py-4" : "py-8"}`}>
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold">Commande enregistrée</h2>
          <p className="text-muted-foreground text-sm">
            Merci {form.name.split(" ")[0] || ""} ! Nous avons bien reçu votre demande.
            Notre équipe vous contacte très vite pour finaliser le paiement et la mise en service de votre carte.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <a
            href={`https://api.whatsapp.com/send/?phone=%2B${WHATSAPP_PHONE.replace(/\D/g, "")}&text=${encodeURIComponent(
              `Bonjour, je viens de passer une commande RIVO-CARD (${form.name}).`
            )}&type=phone_number&app_absent=0`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              type="button"
              className="bg-[hsl(142,70%,45%)] text-white hover:bg-[hsl(142,70%,40%)] px-5 py-2.5 rounded-full font-medium inline-flex items-center gap-2 transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Nous écrire sur WhatsApp
            </button>
          </a>
          {!compact && (
            <Link to="/">
              <button
                type="button"
                className="border border-border text-foreground hover:border-primary hover:text-primary px-5 py-2.5 rounded-full font-medium transition-colors text-sm w-full"
              >
                Retour à l&apos;accueil
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? "" : "bg-card border border-border rounded-2xl p-6 md:p-8"}`}>
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-country">
          Pays *
        </label>
        <select
          id="order-country"
          required
          value={form.country}
          onChange={update("country")}
          className={inputClass}
        >
          <option value="">Sélectionnez votre pays</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-name">
          Nom complet *
        </label>
        <input
          id="order-name"
          type="text"
          required
          value={form.name}
          onChange={update("name")}
          placeholder="Ex : Amadou Diallo"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-phone">
          Téléphone (WhatsApp) *
        </label>
        <input
          id="order-phone"
          type="tel"
          required
          value={form.phone}
          onChange={update("phone")}
          placeholder="Ex : 77 123 45 67"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-email">
          Email
        </label>
        <input
          id="order-email"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="vous@exemple.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-company">
          Entreprise (si pack PME)
        </label>
        <input
          id="order-company"
          type="text"
          value={form.company}
          onChange={update("company")}
          placeholder="Nom de votre entreprise"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-offer">
          Offre souhaitée
        </label>
        <select
          id="order-offer"
          value={form.offer}
          onChange={update("offer")}
          className={inputClass}
        >
          <option value="">Sélectionnez une offre</option>
          {OFFERS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Photo de profil
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Ajoutez votre photo pour accélérer la configuration de votre carte (optionnel).
        </p>
        {photoPreview ? (
          <div className="flex items-center gap-4">
            <img
              src={photoPreview}
              alt="Aperçu"
              className="w-20 h-20 rounded-full object-cover border border-border"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="inline-flex items-center gap-1.5 text-sm text-destructive hover:underline"
            >
              <X className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-background flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-message">
          Précisions (optionnel)
        </label>
        <textarea
          id="order-message"
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
  );
}
