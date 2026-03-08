import { useState } from "react";
import {
  Phone, MessageCircle, Share2, Globe, MapPin, Briefcase,
  ShoppingBag, Building2, Users, Star, Megaphone, UserCheck,
  Menu, CreditCard, Nfc, TrendingUp, Calculator, HandCoins,
  ChevronDown, ShoppingCart, Smartphone, UserPlus, Settings,
} from "lucide-react";

// Remplace par le chemin de ton image carte noire
import jamanetCard from "../assets/jamaney-card.png";

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

const WHATSAPP_PARTNER = "https://api.whatsapp.com/send/?phone=%2B22383962830&text=Bonjour%2C%20je%20suis%20interesse%20pour%20devenir%20partenaire%20JAMANEY%20CARD.&type=phone_number&app_absent=0";
const WHATSAPP_ORDER = "https://api.whatsapp.com/send/?phone=%2B22383962830&text=Bonjour%2C%20je%20souhaite%20commander%20une%20carte%20JAMANEY%20CARD.&type=phone_number&app_absent=0";

const Accueil = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-primary">JAMANEY</span>{" "}
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
          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {/* Mobile menu */}
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight gold-text-glow">
                La carte NFC qui transforme votre{" "}
                <span className="text-primary">image</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Approchez un téléphone, votre profil digital s'ouvre automatiquement.
                <br />
                Plus besoin de carte papier. Plus besoin d'envoyer son numéro manuellement.
                <br />
                <span className="text-foreground font-medium">C'est moderne, professionnel et pratique.</span>
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
            {/* Card image with gold glow */}
            <div className="flex justify-center">
            <div className="relative w-full max-w-md md:max-w-lg animate-pulse-glow">
  <img src={jamanetCard} alt="..." className="w-full h-auto object-contain" />
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
              C'est quoi une carte <span className="text-primary">NFC</span> ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Une carte NFC est une carte intelligente. Quand quelqu'un approche son téléphone de la carte, ça ouvre automatiquement votre profil digital avec toutes vos informations :
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {features.map((f) => (
              <div key={f.label} className="group p-6 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 hover:gold-glow">
                <f.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">{f.label}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Plus besoin de carte papier. Plus besoin d'envoyer son numéro manuellement.
          </p>
        </div>
      </section>

      {/* Pourquoi c'est puissant */}
      <section id="avantages" className="py-20 md:py-28 px-4 border-t border-border/30">
        <div className="container mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Pourquoi c'est <span className="text-primary">puissant</span> ?
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
        <div className="container mx-auto max-w-lg space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            💳 <span className="text-primary">Tarifs</span>
          </h2>
          <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-6 gold-glow">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">JAMANEY CARD</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Carte NFC", price: "10 000 F" },
                { label: "Abonnement annuel", price: "10 000 F" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.price}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-4">
                <span className="font-semibold">Première année</span>
                <span className="text-primary font-bold text-xl">20 000 F</span>
              </div>
              {/* <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Renouvellement</span>
                <span className="font-semibold">10 000 F / an</span>
              </div> */}
            </div>
            <a href={WHATSAPP_ORDER} target="_blank" rel="noopener noreferrer">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md text-base font-medium mt-2 transition-colors">
                Commander ma carte
              </button>
            </a>
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
              🚀 Opportunité <span className="text-primary">Partenaire</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tu veux gagner de l'argent avec JAMANEY CARD ? Deviens partenaire officiel et propose la carte aux entreprises, commerçants, entrepreneurs, influenceurs et responsables d'équipes.
            </p>
          </div>

          {/* Collapsible details */}
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
              {/* Commission details */}
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="rounded-xl border border-primary/30 bg-card p-6 space-y-4 gold-glow">
                  <div className="flex items-center gap-3">
                    <HandCoins className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold">Par client</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission carte</span>
                      <span className="font-semibold text-primary">2 000 F</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission abonnement</span>
                      <span className="font-semibold text-primary">2 000 F</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-primary/10 rounded-lg px-3 mt-2">
                      <span className="font-semibold text-sm">Total par client</span>
                      <span className="text-primary font-bold text-lg">4 000 F</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-card p-6 space-y-4 gold-glow">
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

              {/* Example calculation */}
              <div className="max-w-lg mx-auto rounded-2xl border border-primary/30 bg-card p-8 space-y-6 gold-glow">
                <div className="flex items-center justify-center gap-3">
                  <Calculator className="h-7 w-7 text-primary" />
                  <h3 className="text-xl font-bold">Exemple avec 10 clients</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Gain immédiat</span>
                    <span className="font-bold text-lg">10 × 4 000 = <span className="text-primary">40 000 F</span></span>
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

          {/* WhatsApp CTA */}
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
          <h2 className="text-3xl md:text-5xl font-bold gold-text-glow">
            Modernisez votre image <span className="text-primary">dès aujourd'hui</span>.
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
            <span className="text-primary">JAMANEY</span> CARD
          </p>
          <div className="flex gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JAMANEY CARD. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;
