import type { Address } from '@/types/Firm';

export interface CompanyLookupResult {
  name: string;
  nip: string;
  regon: string | null;
  /** Opcjonalne — gdy brak w odpowiedzi API */
  accountNumber?: string | null;
  /** Zagnieżdżony adres (nazwa pola jak w JSON z Springa) */
  addressDto: Pick<Address, 'street' | 'zip' | 'city'> & {
    id?: number | null;
  };
}
