export interface LiraPayCustomer {
    name: string
    email: string
    phone: string
    document_type: 'CPF' | 'CNPJ'
    document: string
}

export interface LiraPayItem {
    id: string
    title: string
    description: string
    price: number
    quantity: number
    is_physical: boolean
}

export interface LiraPayTransactionRequest {
    external_id: string
    total_amount: number
    payment_method: 'PIX'
    webhook_url: string
    items: LiraPayItem[]
    ip: string
    customer: LiraPayCustomer
}

export interface LiraPayTransactionResponse {
    id: string
    external_id: string
    status: 'AUTHORIZED' | 'PENDING' | 'CHARGEBACK' | 'FAILED' | 'IN_DISPUTE'
    total_value: number
    customer: {
        email: string
        name: string
    }
    payment_method: string
    pix?: {
        payload: string
    }
    hasError: boolean
}

const LIRAPAY_BASE_URL = 'https://api.lirapaybr.com/v1'

export class LiraPayClient {
    private apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${LIRAPAY_BASE_URL}${endpoint}`
        const response = await fetch(url, {
            ...options,
            headers: {
                'api-secret': this.apiKey,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`LiraPay API error (${response.status}): ${error}`)
        }

        return response.json()
    }

    async createTransaction(data: LiraPayTransactionRequest): Promise<LiraPayTransactionResponse> {
        return this.request<LiraPayTransactionResponse>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getTransaction(transactionId: string): Promise<LiraPayTransactionResponse> {
        return this.request<LiraPayTransactionResponse>(`/transactions/${transactionId}`)
    }

    async getAccountInfo() {
        return this.request('/account-info')
    }
}

export const lirapay = new LiraPayClient(process.env.LIRAPAY_API_KEY || '')
