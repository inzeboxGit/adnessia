export type TicketStatType = {
  id: number
  label: string
  count: string
  change: string
  unit?: string
  positive?: boolean
}

export type TransactionRowType = {
  id: string
  clientName: string
  clientImage: string
  reservationType: string
  displayStatus: string
  reservationFinishedAt: string
  reference: string
  description: string
  category: string
  method: string
  status: string
  amount: number
  amountFormatted: string
  currency: string
  createdAtDate: string
  createdAtTime: string
  createdAtValue: number
}
