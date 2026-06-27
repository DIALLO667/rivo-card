import { useState } from "react";
import {
  Phone, MessageCircle, Share2, Globe, MapPin, Briefcase,
  ShoppingBag, Building2, Users, Star, Megaphone, UserCheck,
  Menu, TrendingUp, Calculator, HandCoins, ChevronDown, ShoppingCart,
  Smartphone, UserPlus, Settings, Check,
} from "lucide-react";

import rivoCardBanner from "../assets/rivo-card-banner.png";
import mediumImg from "../assets/offres/medium-10k.png";
import premiumImg from "../assets/offres/premium-15k.png";
import pmeStarterImg from "../assets/offres/pme-starter.png";
import pmeBusinessImg from "../assets/offres/pme-business.png";
import pmePremiumImg from "../assets/offres/pme-premium.png";

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Avantages", href: "#avantages" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Partenaire", href: "#partenaire" },
];

const features = [
  { icon: UserCheck, label: "Nom" },
  { icon: Phone, label: "Numéro" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: MapPin, label: "Localisation" },
  { icon: Share2, label: "Réseaux sociaux" },
  { icon: Globe, label: "Site web" },
];

const advantages = [
  { icon: Briefcase, title: "Entrepreneurs", desc: "Ils veulent être modernes et se démarquer." },
  { icon: Building2, title: "Entreprises", desc: "Elles veulent une image professionnelle." },
  { icon: ShoppingBag, title: "Boutiques", desc: "Elles veulent être visibles et accessibles." },
  { icon: Users, title: "Responsables", desc: "Ils veulent partager leur contact facilement." },
];

const steps = [
  { num: "01", text: "Vous commandez votre carte", icon: ShoppingCart },
  { num: "02", text: "Nous configurons votre profil digital", icon: Settings },
  { num: "03", text: "Vous approchez un téléphone", icon: Smartphone },
  { num: "04", text: "Votre contact s'ouvre automatiquement", icon: UserPlus },
];

const audiences = [
  { icon: Briefcase, label: "Entrepreneurs" },
  { icon: ShoppingBag, label: "Commerçants" },
  { icon: Building2, label: "Entreprises" },
  { icon: Users, label: "Responsables d'équipes" },
  { icon: Megaphone, label: "Influenceurs" },
  { icon: UserCheck, label: "Professionnels" },
];

const offresIndividuelles = [
  {
    id: "medium",
    badge: "MEDIUM",
    title: "Carte NFC Medium",
    oldPrice: "13 000 F",
    price: "10 000 F",
    note: "Compatible iOS et Android",
    image: mediumImg,
    popular: false,
    features: [
      "Photo de profil personnalisée",
      "Bio & slogan personnalisés",
      "Barre d'accès rapide aux icônes",
      "Intégration des liens vers vos réseaux sociaux",
    ],
    whatsappText: "Bonjour, je souhaite commander une carte RIVO-CARD Medium (10 000 F).",
  },
  {
    id: "premium",
    badge: "PREMIUM",
    title: "Carte NFC Premium",
    oldPrice: "20 000 F",
    price: "15 000 F",
    note: "Profil complet + enregistrement contact",
    image: premiumImg,
    popular: true,
    features: [
      "Tout Medium inclus",
      "Carte personnalisée",
      "Intégration de vos coordonnées personnelles",
      "Liens vers votre site internet et réseaux sociaux",
      "Bouton permettant d'enregistrer votre contact",
    ],
    whatsappText: "Bonjour, je souhaite commander une carte RIVO-CARD Premium (15 000 F).",
  },
];

const packsEntreprise = [
  {
    id: "starter",
    name: "PME PACK STARTER",
    accent: "text-cyan-400",
    accentBg: "border-cyan-500/30",
    image: pmeStarterImg,
    whatsappText: "Bonjour, je suis intéressé par un pack entreprise RIVO-CARD.",
  },
  {
    id: "business",
    name: "PME PACK BUSINESS",
    accent: "text-primary",
    accentBg: "border-primary/30",
    image: pmeBusinessImg,
    whatsappText: "Bonjour, je suis intéressé par un pack entreprise RIVO-CARD.",
  },
  {
    id: "premium-pme",
    name: "PME PACK PREMIUM",
    accent: "text-emerald-400",
    accentBg: "border-emerald-500/30",
    image: pmePremiumImg,
    whatsappText: "Bonjour, je suis intéressé par un pack entreprise RIVO-CARD.",
  },
];

const WHATSAPP_PHONE = "+221785207689";
const WHATSAPP_ENTREPRISE_PHONE = "+221787342443";

function whatsappUrl(phone, text) {
  const p = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send/?phone=%2B${p}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
}

const WHATSAPP_PARTNER = whatsappUrl(WHATSAPP_PHONE, "Bonjour, je suis intéressé pour devenir partenaire RIVO-CARD.");
const WHATSAPP_ORDER = whatsappUrl(WHATSAPP_PHONE, "Bonjour, je souhaite commander une carte RIVO-CARD.");
const WHATSAPP_ENTREPRISE = whatsappUrl(WHATSAPP_ENTREPRISE_PHONE, "Bonjour, je suis intéressé par un pack entreprise RIVO-CARD.");

const Accueil = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-primary">Rivo</span>{" "}
            <span className="text-foreground">CARD</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer">
              <button className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Devenir partenaire
              </button>
            </a>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-background border-t border-border px-4 py-6 space-y-4">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-lg text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
              <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Devenir partenaire
              </button>
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight blue-text-glow">
                La carte NFC qui transforme votre{" "}
                <span className="text-primary">image</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Approchez un téléphone, votre profil digital s&apos;ouvre automatiquement.
                <br />
                Plus besoin de carte papier. Plus besoin d&apos;envoyer son numéro manuellement.
                <br />
                <span className="text-foreground font-medium">C&apos;est moderne, professionnel et pratique.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#tarifs">
                  <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-base font-medium w-full sm:w-auto transition-colors">
                    Commander ma carte
                  </button>
                </a>
                <a href="#partenaire">
                  <button className="border border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-md text-base font-medium w-full sm:w-auto transition-colors">
                    Devenir partenaire
                  </button>
                </a>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <img src={rivoCardBanner} alt="Rivo Card" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C'est quoi une carte NFC */}
      <section id="features" className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              C&apos;est quoi une carte <span className="text-primary">NFC</span> ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Une carte NFC est une carte intelligente. Quand quelqu&apos;un approche son téléphone de la carte, ça ouvre automatiquement votre profil digital avec toutes vos informations :
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {features.map((f) => (
              <div key={f.label} className="group p-6 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:blue-glow">
                <f.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">{f.label}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Plus besoin de carte papier. Plus besoin d&apos;envoyer son numéro manuellement.
          </p>
        </div>
      </section>

      {/* Pourquoi c'est puissant */}
      <section id="avantages" className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Pourquoi c&apos;est <span className="text-primary">puissant</span> ?
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Avec une seule carte NFC, ils peuvent partager toutes leurs informations en <span className="text-primary font-semibold">1 seconde</span>.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="p-6 rounded-xl bg-card border border-border/50 space-y-4 hover:border-primary/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <a.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Comment ça <span className="text-primary">fonctionne</span> ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center space-y-4 p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-black text-primary/30">{s.num}</span>
                <p className="text-foreground font-medium text-sm">{s.text}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-primary/30" />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-primary font-semibold text-lg">
            Simple. Moderne. Efficace.
          </p>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-primary">Tarifs</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Des offres adaptées aux particuliers et aux entreprises.
            </p>
          </div>

          {/* Offres individuelles */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {offresIndividuelles.map((offre) => (
              <div
                key={offre.id}
                className={`rounded-2xl border bg-card overflow-hidden flex flex-col transition-all duration-300 hover:blue-glow ${
                  offre.popular ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
                }`}
              >
                <div className="relative min-h-[280px] md:min-h-[340px] bg-[#0a1628] flex items-center justify-center p-2">
                  <img
                    src={offre.image}
                    alt={offre.title}
                    className="w-full h-full max-h-[320px] md:max-h-[380px] object-contain"
                  />
                  {offre.popular && (
                    <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-5 flex-1 flex flex-col">
                  <div>
                    <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
                      CARTE NFC {offre.badge}
                    </span>
                    <h3 className="text-xl font-bold">{offre.title}</h3>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {offre.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-sm text-muted-foreground line-through">{offre.oldPrice}</p>
                    <p className="text-3xl font-bold text-primary">{offre.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">{offre.note}</p>
                  </div>
                  <a href={whatsappUrl(WHATSAPP_PHONE, offre.whatsappText)} target="_blank" rel="noopener noreferrer">
                    <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-colors">
                      Commander
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Packs entreprises */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold">
                Packs <span className="text-primary">Entreprises PME</span>
              </h3>
              <p className="text-muted-foreground">Digitalisez votre entreprise dès aujourd&apos;hui</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {packsEntreprise.map((pack) => (
                <div key={pack.id} className={`rounded-2xl border bg-card overflow-hidden flex flex-col hover:blue-glow transition-all duration-300 ${pack.accentBg}`}>
                  <div className="min-h-[220px] md:min-h-[260px] bg-[#0a1628] flex items-center justify-center p-2">
                    <img src={pack.image} alt={pack.name} className="w-full h-full max-h-[240px] md:max-h-[280px] object-contain" />
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col text-center">
                    <h4 className={`text-lg font-bold ${pack.accent}`}>{pack.name}</h4>
                    <p className="text-2xl md:text-3xl font-bold text-primary flex-1 flex items-center justify-center py-4">
                      Sur demande
                    </p>
                    <a href={whatsappUrl(WHATSAPP_ENTREPRISE_PHONE, pack.whatsappText)} target="_blank" rel="noopener noreferrer">
                      <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors">
                        Contactez-nous
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="max-w-4xl mx-auto rounded-xl bg-[#0F2744] border border-primary/20 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-white font-medium italic">
                La dernière carte de visite que vous achèterez.
              </p>
              <a href={WHATSAPP_ENTREPRISE} target="_blank" rel="noopener noreferrer" className="text-primary font-bold whitespace-nowrap hover:underline">
                +221 78 734 24 43
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Pour <span className="text-primary">qui</span> ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {audiences.map((a) => (
              <div key={a.label} className="p-6 rounded-xl bg-card border border-border/50 text-center space-y-3 hover:border-primary/40 transition-all duration-300">
                <a.icon className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium text-sm">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme Partenaire */}
      <section id="partenaire" className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <Star className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Opportunité <span className="text-primary">Partenaire</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tu veux gagner de l&apos;argent avec RIVO-CARD ? Deviens partenaire officiel et propose la carte aux entreprises, commerçants, entrepreneurs, influenceurs et responsables d&apos;équipes.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setPartnerOpen(!partnerOpen)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-base font-medium flex items-center gap-2 transition-colors"
            >
              Voir les détails du programme
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${partnerOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {partnerOpen && (
            <div className="mt-8 space-y-8 animate-fade-in-up">
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="rounded-xl border border-primary/30 bg-card p-6 space-y-4 blue-glow">
                  <div className="flex items-center gap-3">
                    <HandCoins className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Par client</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission carte</span>
                      <span className="font-semibold text-primary">1 000 F</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission abonnement</span>
                      <span className="font-semibold text-primary">2 000 F</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-primary/10 rounded-lg px-3 mt-2">
                      <span className="font-semibold text-sm">Total par client</span>
                      <span className="text-primary font-bold text-lg">3 000 F</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-card p-6 space-y-4 blue-glow">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Renouvellement</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chaque année, quand ton client renouvelle son abonnement :
                  </p>
                  <div className="flex justify-between items-center py-2 bg-primary/10 rounded-lg px-3">
                    <span className="font-semibold text-sm">Tu gagnes encore</span>
                    <span className="text-primary font-bold text-lg">2 000 F</span>
                  </div>
                </div>
              </div>

              <div className="max-w-lg mx-auto rounded-2xl border border-primary/30 bg-card p-8 space-y-6 blue-glow">
                <div className="flex items-center justify-center gap-3">
                  <Calculator className="h-7 w-7 text-primary" />
                  <h3 className="text-xl font-bold">Exemple avec 10 clients</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Gain immédiat</span>
                    <span className="font-bold text-lg">10 × 3 000 = <span className="text-primary">30 000 F</span></span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Revenu annuel récurrent</span>
                    <span className="font-bold text-lg">10 × 2 000 = <span className="text-primary">20 000 F</span></span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Plus tu trouves de clients, <span className="text-primary font-semibold">plus ton revenu annuel augmente</span>.
                </p>
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer">
              <button className="bg-[hsl(142,70%,45%)] text-white hover:bg-[hsl(142,70%,40%)] px-8 py-3 rounded-md text-base font-medium inline-flex items-center gap-2 transition-colors">
                <MessageCircle className="h-5 w-5" />
                Devenir partenaire via WhatsApp
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta-final" className="py-20 md:py-28 px-4 border-t border-border/30 bg-card">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold blue-text-glow">
            Modernisez votre image <span className="text-primary">dès aujourd&apos;hui</span>.
          </h2>
          <a href={WHATSAPP_ORDER} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-4 rounded-md font-medium transition-colors">
              Commander ma carte maintenant
            </button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/30 py-12 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold">
            <span className="text-primary">RIVO-CARD</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RIVO-CARD. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;
