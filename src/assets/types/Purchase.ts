import { PaymentStatus } from "@/assets/types/PaymentStatus";
export interface Purchase {
  id: number;
  idCard: number;
  idFirm: number;
  idUser: number;
  name: string;
  purchaseDate: string;
  amount: number;
  paymentDeadline: string;
  paymentDate: string;
  otherInfo: string;
  paymentStatus: PaymentStatus;
  isInstallment: boolean;
}
