export interface DonationInput {
  donatorName: string;
  amount: number;
  currency?: string;
  message?: string;
}

export interface Donation extends DonationInput {
  id: string;
  streamKey: string;
  currency: string;
  message: string;
  createdAt: string;
}

export interface DonationAlertEvent {
  type: "donation";
  data: Donation;
}
