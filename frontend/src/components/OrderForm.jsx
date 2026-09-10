import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CheckCircle2, MessageCircle, Camera, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "";

export const COUNTRIES = [
  { value: "mali", label: "Mali" },
  { value: "senegal", label: "Sénégal" },
  { value: "burkina-faso", label: "Burkina Faso" },
  { value: "autre", label: "Autre pays" },
];

// Indicatifs proposés devant le champ téléphone. `dial` = indicatif sans le "+".
export const DIAL_CODES = [
  { code: "223", label: "🇲🇱 Mali (+223)" },
  { code: "221", label: "🇸🇳 Sénégal (+221)" },
  { code: "226", label: "🇧🇫 Burkina Faso (+226)" },
  { code: "225", label: "🇨🇮 Côte d'Ivoire (+225)" },
  { code: "224", label: "🇬🇳 Guinée (+224)" },
  { code: "227", label: "🇳🇪 Niger (+227)" },
  { code: "228", label: "🇹🇬 Togo (+228)" },
  { code: "229", label: "🇧🇯 Bénin (+229)" },
  { code: "233", label: "🇬🇭 Ghana (+233)" },
  { code: "234", label: "🇳🇬 Nigeria (+234)" },
  { code: "33", label: "🇫🇷 France (+33)" },
  { code: "1", label: "🇺🇸 USA / Canada (+1)" },
];

const WHATSAPP_PHONE = "+221785207689";

// Construit le numéro final au format international "00<indicatif><numéro local>".
// - on ne garde que les chiffres du numéro local
// - on retire les zéros de tête du numéro local (ex : 0 76 12 34 -> 76 12 34)
// - on préfixe "00" + l'indicatif choisi dans le menu déroulant
function buildPhone(rawLocal, dial) {
  const local = (rawLocal || "").replace(/\D/g, "").replace(/^0+/, "");
  return `00${dial}${local}`;
}

// Chiffres utiles du numéro local (pour la validation de longueur).
function localDigits(rawLocal) {
  return (rawLocal || "").replace(/\D/g, "").replace(/^0+/, "");
}

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/mon_pseudo" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/ma.page" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/mon_pseudo" },
];

export default function OrderForm({ onSuccess, compact = false }) {
  const [form, setForm] = useState({
    name: "",
    dial: "223",
    phone: "",
    email: "",
    country: "mali",
    website: "",
    instagram: "",
    facebook: "",
    snapchat: "",
  });
  const [socialOpen, setSocialOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

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
    if (!form.name.trim()) {
      setError("Le nom complet est obligatoire.");
      return;
    }
    if (localDigits(form.phone).length < 6) {
      setError("Le numéro de téléphone est incomplet (au moins 6 chiffres).");
      return;
    }
    if (!form.country) {
      setError("Veuillez indiquer votre pays.");
      return;
    }
    if (!photo) {
      setError("La photo de profil est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", buildPhone(form.phone, form.dial));
      fd.append("country", form.country);
      if (form.email.trim()) fd.append("email", form.email.trim());
      if (form.website.trim()) fd.append("website", form.website.trim());
      if (form.instagram.trim()) fd.append("instagram", form.instagram.trim());
      if (form.facebook.trim()) fd.append("facebook", form.facebook.trim());
      if (form.snapchat.trim()) fd.append("snapchat", form.snapchat.trim());
      fd.append("photo", photo);
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
        <div className="flex">
          <select
            aria-label="Indicatif pays"
            value={form.dial}
            onChange={update("dial")}
            className="h-12 px-2 rounded-l-lg border border-r-0 border-border bg-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 max-w-[7.5rem]"
          >
            {DIAL_CODES.map((d) => (
              <option key={d.code} value={d.code}>{d.label}</option>
            ))}
          </select>
          <input
            id="order-phone"
            type="tel"
            required
            value={form.phone}
            onChange={update("phone")}
            placeholder="76 12 34 56"
            className="w-full h-12 px-4 rounded-r-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Numéro final : +{form.dial} {localDigits(form.phone) || "…"}
        </p>
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
        <label className="block text-sm font-medium mb-1.5" htmlFor="order-website">
          Lien du site
        </label>
        <input
          id="order-website"
          type="url"
          value={form.website}
          onChange={update("website")}
          placeholder="https://mon-site.com"
          className={inputClass}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setSocialOpen((o) => !o)}
          className="w-full flex items-center justify-between h-12 px-4 rounded-lg border border-border bg-background text-sm font-medium hover:border-primary/50 transition-colors"
        >
          <span>
            Réseaux sociaux <span className="text-muted-foreground font-normal">(facultatif)</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${socialOpen ? "rotate-180" : ""}`} />
        </button>
        {socialOpen && (
          <div className="mt-3 space-y-3">
            {SOCIAL_FIELDS.map((s) => (
              <div key={s.key}>
                <label className="block text-xs font-medium mb-1 text-muted-foreground" htmlFor={`order-${s.key}`}>
                  {s.label}
                </label>
                <input
                  id={`order-${s.key}`}
                  type="url"
                  value={form[s.key]}
                  onChange={update(s.key)}
                  placeholder={s.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Photo de profil *
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Obligatoire — elle sera utilisée pour configurer votre carte.
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
