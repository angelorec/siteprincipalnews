import { CheckoutClient } from "./checkout-client"

interface CheckoutPageProps {
  params: {
    transactionId: string
  }
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return <CheckoutClient transactionId={params.transactionId} />
}
