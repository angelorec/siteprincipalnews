"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, Clock, Smartphone, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PaymentStorage } from "@/lib/payment-storage"

interface PaymentData {
  transactionId: string
  qrcodeImageUrl?: string
  qrcodeBase64?: string
  pixCopiaECola: string
  expiresAt: string
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED"
  planId?: string
  amount?: number
}

interface CheckoutClientProps {
  transactionId: string
}

export function CheckoutClient({ transactionId }: CheckoutClientProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [pollCount, setPollCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [redirectProgress, setRedirectProgress] = useState(0)
  const router = useRouter()

  // Fetch initial payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const localTransaction = PaymentStorage.get(transactionId)

        if (localTransaction) {
          setPaymentData({
            transactionId: localTransaction.transactionId,
            qrcodeImageUrl: localTransaction.qrcodeImageUrl,
            qrcodeBase64: localTransaction.qrcodeBase64,
            pixCopiaECola: localTransaction.pixCopiaECola,
            expiresAt: localTransaction.expiresAt,
            status: localTransaction.status,
            planId: localTransaction.planId,
            amount: localTransaction.amount,
          })
        } else {
          // Fallback mock data for development
          const mockData: PaymentData = {
            transactionId,
            qrcodeImageUrl: `/placeholder.svg?height=300&width=300&query=QR Code PIX`,
            pixCopiaECola: `00020126580014br.gov.bcb.pix0136${transactionId}520400005303986540${(4999 / 100).toFixed(2)}5802BR5925Natalia Katowicz6009SAO PAULO62070503***6304`,
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
            status: "PENDING",
            planId: "premium",
            amount: 4999,
          }
          setPaymentData(mockData)
        }
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [transactionId])

  // Poll payment status
  useEffect(() => {
    if (!paymentData || paymentData.status !== "PENDING") return

    const pollStatus = async () => {
      setIsPolling(true)
      try {
        const response = await fetch(`/api/lirapay/status/${transactionId}`)
        const data = await response.json()

        setPollCount((prev) => prev + 1)

        if (data.status === "PAID") {
          setPaymentData((prev) => (prev ? { ...prev, status: "PAID" } : null))
          setShowSuccessPopup(true)
        } else if (data.status === "EXPIRED") {
          setPaymentData((prev) => (prev ? { ...prev, status: "EXPIRED" } : null))
        }
      } catch (error) {
        console.error("Error polling status:", error)
      } finally {
        setIsPolling(false)
      }
    }

    const interval = setInterval(pollStatus, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [paymentData, transactionId, router])

  // Update countdown timer
  useEffect(() => {
    if (!paymentData) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      } else {
        setTimeLeft("00:00")
        setPaymentData((prev) => (prev ? { ...prev, status: "EXPIRED" } : null))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [paymentData])
  // Success Redirect Progress
  useEffect(() => {
    if (!showSuccessPopup) return

    const duration = 7000 // 7 seconds
    const interval = 50 // update every 50ms
    const steps = duration / interval
    const increment = 100 / steps

    const timer = setInterval(() => {
      setRedirectProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + increment
      })
    }, interval)

    const redirectTimer = setTimeout(() => {
      window.location.href = "https://katowiczvip.vercel.app/login"
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [showSuccessPopup])

  const copyToClipboard = async () => {
    if (!paymentData) return

    try {
      await navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  const openBankApp = () => {
    if (!paymentData) return

    // Try to open common banking apps
    const bankApps = [
      `nubank://qr/payment?code=${encodeURIComponent(paymentData.pixCopiaECola)}`,
      `inter://pix/payment?code=${encodeURIComponent(paymentData.pixCopiaECola)}`,
      `itau://pix/payment?code=${encodeURIComponent(paymentData.pixCopiaECola)}`,
    ]

    // Try the first app, fallback to generic intent
    window.location.href = bankApps[0]
  }

  const manualRefresh = async () => {
    if (!paymentData) return

    setIsPolling(true)
    try {
      const response = await fetch(`/api/lirapay/status/${transactionId}`)
      const data = await response.json()

      if (data.status === "PAID") {
        setPaymentData((prev) => (prev ? { ...prev, status: "PAID" } : null))
        setShowSuccessPopup(true)
      } else if (data.status === "EXPIRED") {
        setPaymentData((prev) => (prev ? { ...prev, status: "EXPIRED" } : null))
      }
    } catch (error) {
      console.error("Error refreshing status:", error)
    } finally {
      setIsPolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-400">Carregando pagamento...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-8 text-center max-w-sm w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Erro ao carregar dados do pagamento</p>
          <Button onClick={() => router.push("/")} className="w-full bg-gradient-to-r from-primary to-secondary">
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-800 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Pagamento PIX</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="p-4 space-y-6">
          {/* Status Section */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {paymentData.status === "PAID" ? (
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              ) : paymentData.status === "EXPIRED" ? (
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>

            <Badge
              className={`mb-4 ${paymentData.status === "PAID"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : paymentData.status === "EXPIRED"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-primary/20 text-primary border-primary/30"
                }`}
            >
              {paymentData.status === "PAID"
                ? "Pagamento Confirmado!"
                : paymentData.status === "EXPIRED"
                  ? "Pagamento Expirado"
                  : "Aguardando Pagamento"}
            </Badge>

            <h2 className="text-xl font-bold mb-2">
              {paymentData.status === "PAID"
                ? "Sucesso!"
                : paymentData.status === "EXPIRED"
                  ? "Tempo Esgotado"
                  : "Finalize seu Pagamento"}
            </h2>

            {paymentData.amount && (
              <p className="text-2xl font-bold text-primary mb-4">
                R$ {(paymentData.amount / 100).toFixed(2).replace(".", ",")}
              </p>
            )}

            {paymentData.status === "PENDING" && (
              <div className="bg-gray-900 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Tempo restante:</p>
                <p className="text-2xl font-bold text-primary mb-3">{timeLeft}</p>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  {isPolling && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Verificações: {pollCount}</span>
                  <button
                    onClick={manualRefresh}
                    disabled={isPolling}
                    className="ml-2 px-2 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 inline ${isPolling ? "animate-spin" : ""}`} />
                    Atualizar
                  </button>
                </div>
              </div>
            )}
          </div>

          {paymentData.status === "PAID" ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <h3 className="text-xl font-semibold mb-2">Pagamento Confirmado!</h3>
              <p className="text-gray-400 mb-6">Você será redirecionado para a área de membros em instantes...</p>
              <Button
                onClick={() => router.push("/sucesso")}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Acessar Conteúdo
              </Button>
            </motion.div>
          ) : paymentData.status === "EXPIRED" ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <h3 className="text-xl font-semibold mb-2">Pagamento Expirado</h3>
              <p className="text-gray-400 mb-6">O tempo para pagamento esgotou. Você pode gerar um novo PIX.</p>
              <Button onClick={() => router.push("/")} className="w-full bg-gradient-to-r from-primary to-secondary">
                Gerar Novo PIX
              </Button>
            </motion.div>
          ) : (
            <>
              {/* QR Code */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Escaneie o QR Code</h3>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                  {paymentData.qrcodeBase64 ? (
                    <Image
                      src={paymentData.qrcodeBase64}
                      alt="QR Code PIX"
                      width={300}
                      height={300}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Copy and Paste */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ou copie o código PIX</h3>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <p className="text-xs text-gray-400 break-all font-mono leading-relaxed">
                    {paymentData.pixCopiaECola}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                  disabled={copied}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copiado!" : "Copiar Código"}
                </Button>

                <Button onClick={openBankApp} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Abrir App do Banco
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-900 p-4 rounded-xl">
                <h4 className="font-semibold mb-3 text-primary">Como pagar:</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha a opção PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                  <li>Aguarde a confirmação automática</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(255,255,255,0.05)]"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-3xl font-playfair font-black uppercase tracking-tighter italic mb-4">
              Obrigado pela <span className="text-primary tracking-normal">compra</span>
            </h2>

            <p className="text-gray-400 leading-relaxed mb-8">
              Você está sendo redirecionado para a área de membros, use sua senha e login de cadastro para entrar, aproveite 🔥
            </p>

            <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-4">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${redirectProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span>Redirecionando</span>
              <span>{Math.round(redirectProgress)}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
