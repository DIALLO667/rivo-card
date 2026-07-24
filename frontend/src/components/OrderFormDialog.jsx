import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import OrderForm from "./OrderForm";

export default function OrderFormDialog({ open, onOpenChange, initialOffer = "" }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Commander ma <span className="text-primary">carte</span>
          </DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire, notre équipe vous recontacte pour confirmer le paiement et activer votre carte.
          </DialogDescription>
        </DialogHeader>
        <OrderForm
          key={`${open}-${initialOffer}`}
          initialOffer={initialOffer}
          compact
        />
      </DialogContent>
    </Dialog>
  );
}
