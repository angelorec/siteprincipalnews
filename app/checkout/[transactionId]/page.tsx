import { CheckoutClient } from "./checkout-client"

interface CheckoutPageProps {
  params: {
    transactionId: string
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { transactionId } = await params
  return <CheckoutClient transactionId={transactionId} />
}
