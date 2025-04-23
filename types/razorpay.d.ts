interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  [key: string]: any;
}

interface Razorpay {
  new (options: RazorpayOptions): {
    open: () => void;
    on: (event: string, callback: (response: any) => void) => void;
  };
}

declare global {
  interface Window {
    Razorpay: Razorpay;
  }
}
