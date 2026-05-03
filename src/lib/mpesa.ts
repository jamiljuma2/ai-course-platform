// ============================================================
// M-PESA DARAJA API INTEGRATION
// Supports: STK Push, Callback Processing, Query Status
// ============================================================

import axios from 'axios'
import crypto from 'crypto'
import type { MpesaSTKPushRequest, MpesaSTKPushResponse } from '@/types'

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

// Generate OAuth access token
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  )
  return response.data.access_token
}

// Generate timestamp: YYYYMMDDHHmmss
function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('')
}

// Generate password: base64(shortcode + passkey + timestamp)
function generatePassword(timestamp: string): string {
  const raw = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  return Buffer.from(raw).toString('base64')
}

function getCallbackUrl(): string {
  return (
    process.env.MPESA_CALLBACK_URL ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/webhook/mpesa`
      : 'http://localhost:3000/api/webhook/mpesa')
  )
}

// Format phone to 254XXXXXXXXX
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '254' + digits.slice(1)
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('+254')) return digits.slice(1)
  return '254' + digits
}

// Validate Kenyan phone number
export function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatPhone(phone)
  return /^2547[0-9]{8}$/.test(formatted) || /^2541[0-9]{8}$/.test(formatted)
}

// Initiate STK Push (Lipa Na M-Pesa Online)
export async function initiateSTKPush(
  req: MpesaSTKPushRequest
): Promise<MpesaSTKPushResponse> {
  // If Lipana is configured, prefer Lipana STK push (new provider)
  if (process.env.LIPANA_API_KEY) {
    return await initiateLipanaSTKPush(req)
  }
  const accessToken = await getAccessToken()
  const timestamp = getTimestamp()
  const password = generatePassword(timestamp)
  const phone = formatPhone(req.phone)

  if (!isValidKenyanPhone(req.phone)) {
    throw new Error('Invalid Kenyan phone number. Use format: 07XXXXXXXX or 01XXXXXXXX')
  }

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(req.amount), // M-Pesa requires integer
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: req.accountRef.substring(0, 12), // Max 12 chars
    TransactionDesc: req.description.substring(0, 13), // Max 13 chars
  }

  const response = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data
}

// ----------------------
// Lipana integration
// ----------------------
async function initiateLipanaSTKPush(
  req: MpesaSTKPushRequest
): Promise<MpesaSTKPushResponse> {
  const phone = formatPhone(req.phone)
  if (!isValidKenyanPhone(req.phone)) {
    throw new Error('Invalid Kenyan phone number. Use format: 07XXXXXXXX or 01XXXXXXXX')
  }

  const amount = Math.round(req.amount)
  if (amount < 10) throw new Error('Minimum amount is Ksh 10')

  const callbackUrl = getCallbackUrl()
  const requestPayload = {
    phone,
    amount,
    description: req.description,
    account_ref: req.accountRef,
    accountRef: req.accountRef,
    account_reference: req.accountRef,
    reference: req.accountRef,
    callback_url: callbackUrl,
    callbackUrl,
    callbackURL: callbackUrl,
  }

  const res = await axios.post(
    'https://api.lipana.dev/v1/transactions/push-stk',
    requestPayload,
    {
      headers: {
        'x-api-key': process.env.LIPANA_API_KEY as string,
        'Content-Type': 'application/json',
      },
    }
  )

  // Map Lipana response to the shape callers expect (best-effort)
  const body = res.data || {}
  const data = body.data || {}

  return {
    // Daraja field names expected elsewhere: CheckoutRequestID, MerchantRequestID
    CheckoutRequestID: data.checkoutRequestID || data.checkout_request_id || null,
    MerchantRequestID: data.transactionId || data.transaction_id || null,
    // include raw lipana response for debugging/inspection
    raw: body,
  } as unknown as MpesaSTKPushResponse
}

export function verifyLipanaSignature(rawBody: string, signatureHeader?: string) {
  if (!signatureHeader) return false
  const secret = process.env.LIPANA_WEBHOOK_SECRET
  if (!secret) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  } catch (e) {
    return false
  }
}

// Query STK Push transaction status
export async function querySTKPushStatus(checkoutRequestId: string) {
  const accessToken = await getAccessToken()
  const timestamp = getTimestamp()
  const password = generatePassword(timestamp)

  const response = await axios.post(
    `${BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}

// Parse M-Pesa callback metadata into a flat object
export function parseCallbackMetadata(
  items: Array<{ Name: string; Value: string | number }>
): Record<string, string | number> {
  return items.reduce((acc, item) => {
    acc[item.Name] = item.Value
    return acc
  }, {} as Record<string, string | number>)
}
