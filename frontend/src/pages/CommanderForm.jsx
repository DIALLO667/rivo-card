import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OrderForm from "@/components/OrderForm";

export default function CommanderForm() {
  const [searchParams] = useSearchParams();
  const initialOffer = searchParams.get("offer") || "";

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

        <OrderForm initialOffer={initialOffer} />
      </div>
    </div>
  );
}
