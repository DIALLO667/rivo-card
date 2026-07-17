import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone, MessageCircle, Share2, Globe, MapPin, Briefcase,
  ShoppingBag, Building2, Users, Star, Megaphone, UserCheck,
  Menu, ShoppingCart,
  Smartphone, UserPlus, Settings, Check, PlayCircle, X,
} from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Démo", href: "#demo" },
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

const trustBadges = [
  { icon: Smartphone, label: "Compatible iOS & Android" },
  { icon: Settings, label: "Configuration incluse" },
  { icon: MessageCircle, label: "Support WhatsApp réactif" },
];

const offresIndividuelles = [
  {
    id: "medium",
    badge: "MEDIUM",
    title: "Carte NFC Medium",
    oldPrice: "13 000 F",
    price: "10 000 F",
    note: "Compatible iOS et Android",
    popular: false,
    features: [
      "Photo de profil personnalisée",
      "Bio & slogan personnalisés",
      "Barre d'accès rapide aux icônes",
      "Intégration des liens vers vos réseaux sociaux",
    ],
  },
  {
    id: "premium",
    badge: "PREMIUM",
    title: "Carte NFC Premium",
    oldPrice: "20 000 F",
    price: "15 000 F",
    note: "Profil complet + enregistrement contact",
    popular: true,
    features: [
      "Tout Medium inclus",
      "Carte personnalisée",
      "Intégration de vos coordonnées personnelles",
      "Liens vers votre site internet et réseaux sociaux",
      "Bouton permettant d'enregistrer votre contact",
    ],
  },
];

const packsEntreprise = [
  {
    id: "starter",
    name: "PME Pack Starter",
    offerValue: "pme-starter",
    popular: false,
    features: [
      "10 cartes NFC personnalisées",
      "Dashboard Administrateur inclus",
      "Gestion simplifiée des collaborateurs",
      "Cartes aux couleurs et au logo de l'entreprise",
      "Mise à jour illimitée",
    ],
  },
  {
    id: "business",
    name: "PME Pack Business",
    offerValue: "pme-business",
    popular: true,
    features: [
      "25 cartes NFC personnalisées",
      "Dashboard Administrateur inclus",
      "Gestion simplifiée des collaborateurs",
      "Cartes aux couleurs et au logo de l'entreprise",
      "Mise à jour illimitée",
    ],
  },
  {
    id: "premium-pme",
    name: "PME Pack Premium",
    offerValue: "pme-premium",
    popular: false,
    features: [
      "50 cartes NFC personnalisées",
      "Dashboard Administrateur inclus",
      "Gestion simplifiée des collaborateurs",
      "Cartes aux couleurs et au logo de l'entreprise",
      "Mise à jour illimitée",
      "Gestion avancée des équipes",
    ],
  },
];

const WHATSAPP_PHONE = "+221785207689";
const WHATSAPP_ENTREPRISE_PHONE = "+221787342443";

function whatsappUrl(phone, text) {
  const p = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send/?phone=%2B${p}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
}

const WHATSAPP_PARTNER = whatsappUrl(WHATSAPP_PHONE, "Bonjour, je suis intéressé pour devenir partenaire RIVO-CARD.");
const WHATSAPP_ENTREPRISE = whatsappUrl(WHATSAPP_ENTREPRISE_PHONE, "Bonjour, je suis intéressé par un pack entreprise RIVO-CARD.");

const CLOUDINARY_BASE = "https://res.cloudinary.com/dwe9byiww/video/upload";
const CLOUDINARY_VERSION = "v1784264377/video-nfc_rcyvuq";
const DEMO_VIDEO = `${CLOUDINARY_BASE}/w_720,q_auto/${CLOUDINARY_VERSION}.mp4`;
const DEMO_POSTER = `${CLOUDINARY_BASE}/w_720,so_1/${CLOUDINARY_VERSION}.jpg`;
const TEASER_VIDEO = `${CLOUDINARY_BASE}/so_0,eo_8,w_480,q_auto/${CLOUDINARY_VERSION}.mp4`;
const TEASER_POSTER = `${CLOUDINARY_BASE}/so_1,w_480/${CLOUDINARY_VERSION}.jpg`;

function PhoneFrame({ src, poster, autoPlay, loop, muted, controls, sizeClass = "max-w-[280px]" }) {
  return (
    <div className={`relative w-full ${sizeClass} mx-auto`}>
      <div className="relative aspect-[9/16] rounded-[2.25rem] border-[6px] border-foreground bg-foreground overflow-hidden shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)]">
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-foreground rounded-b-xl" />
      </div>
    </div>
  );
}

const Accueil = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-primary">Rivo</span>{" "}
            <span className="text-foreground">CARD</span>
          </a>
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer">
              <button className="text-sm font-medium text-primary hover:underline transition-colors">
                Devenir partenaire
              </button>
            </a>
            <Link to="/commander">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                Commander
              </button>
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-background border-t border-border px-4 py-6 space-y-4">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-lg text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
            <Link to="/commander" onClick={() => setMobileOpen(false)}>
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors">
                Commander
              </button>
            </Link>
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
              <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Devenir partenaire
              </button>
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                LA CARTE DE VISITE NOUVELLE GÉNÉRATION
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
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
                <Link to="/commander">
                  <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full text-base font-semibold w-full sm:w-auto transition-colors">
                    Commander ma carte
                  </button>
                </Link>
                <a href="#demo">
                  <button className="border border-border text-foreground hover:border-primary hover:text-primary px-8 py-3 rounded-full text-base font-medium w-full sm:w-auto transition-colors inline-flex items-center justify-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Voir la démo
                  </button>
                </a>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                {trustBadges.map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <t.icon className="h-4 w-4 text-primary" />
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-primary/10 blur-[80px]" />
              <a href="#demo" className="relative block group">
                <PhoneFrame
                  src={TEASER_VIDEO}
                  poster={TEASER_POSTER}
                  autoPlay
                  loop
                  muted
                  sizeClass="max-w-[300px] md:max-w-[320px]"
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap group-hover:bg-primary transition-colors">
                  Voir la démo complète
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* C'est quoi une carte NFC */}
      <section id="features" className="py-20 md:py-28 px-4 border-t border-border bg-card">
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
              <div key={f.label} className="group p-6 rounded-xl bg-background border border-border hover:border-primary/40 transition-all duration-300 blue-glow">
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

      {/* Voyez-la en action */}
      <section id="demo" className="py-20 md:py-28 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="order-2 md:order-1">
              <PhoneFrame
                src={DEMO_VIDEO}
                poster={DEMO_POSTER}
                controls
                sizeClass="max-w-[300px] md:max-w-[340px]"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                PREUVE PAR L&apos;IMAGE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Voyez-la <span className="text-primary">en action</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Un simple contact entre la carte et un téléphone suffit : le profil digital s&apos;affiche
                instantanément, avec tous les liens et coordonnées configurés pour vous.
              </p>
              <ul className="space-y-3">
                {[
                  "Aucune application à installer côté client",
                  "Fonctionne avec la majorité des smartphones récents",
                  "Votre profil est configuré par notre équipe avant réception",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/commander" className="inline-block pt-2">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-full text-base font-semibold transition-colors">
                  Commander ma carte
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi c'est puissant */}
      <section id="avantages" className="py-20 md:py-28 px-4 border-t border-border bg-card">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Pourquoi c&apos;est <span className="text-primary">puissant</span> ?
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Avec une seule carte NFC, ils peuvent partager toutes leurs informations en <span className="text-primary font-semibold">1 seconde</span>.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="p-6 rounded-xl bg-background border border-border space-y-4 hover:border-primary/40 transition-all duration-300">
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
      <section className="py-20 md:py-28 px-4 border-t border-border">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Comment ça <span className="text-primary">fonctionne</span> ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center space-y-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-black text-primary/25">{s.num}</span>
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
      <section id="tarifs" className="py-20 md:py-28 px-4 border-t border-border bg-card">
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
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {offresIndividuelles.map((offre) => (
              <div
                key={offre.id}
                className={`relative rounded-2xl border bg-background p-8 flex flex-col transition-all duration-300 blue-glow ${
                  offre.popular ? "border-primary ring-1 ring-primary/30" : "border-border"
                }`}
              >
                {offre.popular && (
                  <span className="absolute -top-3 right-8 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Populaire
                  </span>
                )}
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <span className="inline-block text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                      CARTE NFC {offre.badge}
                    </span>
                    <h3 className="text-xl font-bold">{offre.title}</h3>
                  </div>
                  <div className="pb-2 border-b border-border">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-primary">{offre.price}</p>
                      <p className="text-sm text-muted-foreground line-through">{offre.oldPrice}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{offre.note}</p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {offre.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/commander?offer=${offre.id}`}>
                    <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-semibold transition-colors">
                      Commander
                    </button>
                  </Link>
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
            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
              {packsEntreprise.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl border bg-background p-8 flex flex-col transition-all duration-300 blue-glow ${
                    pack.popular ? "border-primary ring-1 ring-primary/30" : "border-border"
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-3 right-8 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Recommandé
                    </span>
                  )}
                  <div className="space-y-5 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold">{pack.name}</h4>
                    <ul className="space-y-2 flex-1">
                      {pack.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-2xl font-bold text-primary pt-2 border-t border-border">
                      Sur demande
                    </p>
                    <Link to={`/commander?offer=${pack.offerValue}`}>
                      <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 rounded-full font-semibold transition-colors">
                        Contactez-nous
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="max-w-4xl mx-auto rounded-xl bg-[hsl(222,47%,11%)] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-white font-medium italic">
                La dernière carte de visite que vous achèterez.
              </p>
              <a href={WHATSAPP_ENTREPRISE} target="_blank" rel="noopener noreferrer" className="text-primary-foreground bg-primary px-4 py-2 rounded-full font-bold whitespace-nowrap hover:bg-primary/90 transition-colors">
                +221 78 734 24 43
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-20 md:py-28 px-4 border-t border-border">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Pour <span className="text-primary">qui</span> ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {audiences.map((a) => (
              <div key={a.label} className="p-6 rounded-xl bg-card border border-border text-center space-y-3 hover:border-primary/40 transition-all duration-300">
                <a.icon className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium text-sm">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme Partenaire */}
      <section id="partenaire" className="py-20 md:py-28 px-4 border-t border-border bg-card">
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

          <div className="text-center pt-4">
            <a href={WHATSAPP_PARTNER} target="_blank" rel="noopener noreferrer">
              <button className="bg-[hsl(142,70%,45%)] text-white hover:bg-[hsl(142,70%,40%)] px-8 py-3 rounded-full text-base font-medium inline-flex items-center gap-2 transition-colors">
                <MessageCircle className="h-5 w-5" />
                Nous contacter sur WhatsApp
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta-final" className="py-20 md:py-28 px-4 bg-[hsl(222,47%,11%)] text-white">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Modernisez votre image <span className="text-primary">dès aujourd&apos;hui</span>.
          </h2>
          <Link to="/commander" className="mt-4 inline-block">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-4 rounded-full font-semibold transition-colors">
              Commander ma carte maintenant
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[hsl(222,47%,11%)] text-white/80 px-4 pt-16 pb-8 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="space-y-3 md:col-span-2">
              <p className="text-xl font-bold text-white">
                <span className="text-primary">Rivo</span> CARD
              </p>
              <p className="text-sm max-w-xs">
                La carte de visite digitale qui transforme votre image professionnelle. Approchez, partagez, impressionnez.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Navigation</p>
              <div className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Contact</p>
              <div className="flex flex-col gap-2 text-sm">
                <a href={whatsappUrl(WHATSAPP_PHONE, "Bonjour, j'ai une question sur RIVO-CARD.")} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Particuliers — +221 78 520 76 89
                </a>
                <a href={whatsappUrl(WHATSAPP_ENTREPRISE_PHONE, "Bonjour, j'ai une question sur les packs entreprise RIVO-CARD.")} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Entreprises — +221 78 734 24 43
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} RIVO-CARD. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;
