export interface DokuConfig {
    clientId: string;
    secretKey: string;
    environment: "sandbox" | "production" | string;
    callbackUrl?: string;
    returnUrl?: string;
}

export interface DokuPaymentItem {
    name: string;
    price: number;
    quantity: number;
}

export interface DokuCheckoutRequestParams {
    invoiceNumber: string;
    amount: number;
    items: DokuPaymentItem[];
    customer?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    callbackUrl?: string;
    returnUrl?: string;
    paymentDueDateMinutes?: number;
}

export interface DokuCheckoutResponse {
    success: boolean;
    paymentUrl?: string;
    dokuReference?: string;
    rawResponse?: any;
    error?: string;
    isMock?: boolean;
}

/**
 * Generate DOKU SHA-256 Digest in Base64 using Universal Web Crypto API
 */
export async function generateDokuDigest(bodyString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(bodyString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(hashBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Generate DOKU HMAC-SHA256 Signature using Universal Web Crypto API
 */
export async function generateDokuSignature(params: {
    clientId: string;
    secretKey: string;
    requestId: string;
    requestTimestamp: string;
    requestTarget: string;
    digest: string;
}): Promise<string> {
    const component = `Client-Id:${params.clientId}\nRequest-Id:${params.requestId}\nRequest-Timestamp:${params.requestTimestamp}\nRequest-Target:${params.requestTarget}\nDigest:${params.digest}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(params.secretKey);
    const messageData = encoder.encode(component);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `HMACSHA256=${btoa(binary)}`;
}

/**
 * Verify incoming DOKU Webhook Notification Signature
 */
export async function verifyDokuSignature(params: {
    clientId: string;
    secretKey: string;
    requestId: string;
    requestTimestamp: string;
    requestTarget: string;
    signature: string;
    rawBody: string;
}): Promise<boolean> {
    const digest = await generateDokuDigest(params.rawBody);
    const expectedSignature = await generateDokuSignature({
        clientId: params.clientId,
        secretKey: params.secretKey,
        requestId: params.requestId,
        requestTimestamp: params.requestTimestamp,
        requestTarget: params.requestTarget,
        digest,
    });

    return expectedSignature === params.signature;
}

/**
 * Get DOKU Base API URL
 */
export function getDokuBaseUrl(environment: string): string {
    return environment === "production" ? "https://api.doku.com" : "https://api-sandbox.doku.com";
}

/**
 * Create DOKU Checkout Payment Session
 */
export async function createDokuCheckoutSession(
    config: DokuConfig,
    params: DokuCheckoutRequestParams
): Promise<DokuCheckoutResponse> {
    // If credentials are not configured or are placeholder values, provide a structured mock sandbox response for safe testing
    if (!config.clientId || !config.secretKey || config.clientId === "YOUR_DOKU_CLIENT_ID") {
        return {
            success: true,
            isMock: true,
            dokuReference: `MOCK-DOKU-${Date.now()}`,
            paymentUrl: `/payment/pending?invoice=${params.invoiceNumber}&mock=true`,
        };
    }

    const baseUrl = getDokuBaseUrl(config.environment);
    const requestTarget = "/checkout/v1/payment";
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    const payload = {
        order: {
            invoice_number: params.invoiceNumber,
            amount: params.amount,
            line_items: params.items.map(item => ({
                name: item.name.slice(0, 100),
                price: item.price,
                quantity: item.quantity,
            })),
            callback_url: params.returnUrl || config.returnUrl,
            auto_redirect: true,
        },
        payment: {
            payment_due_date: params.paymentDueDateMinutes || 60,
        },
        customer: {
            name: params.customer?.name || "Pelanggan",
            email: params.customer?.email || "customer@example.com",
            phone: params.customer?.phone || "081234567890",
        },
    };

    const bodyString = JSON.stringify(payload);
    const digest = await generateDokuDigest(bodyString);
    const signature = await generateDokuSignature({
        clientId: config.clientId,
        secretKey: config.secretKey,
        requestId,
        requestTimestamp,
        requestTarget,
        digest,
    });

    try {
        const response = await $fetch<any>(`${baseUrl}${requestTarget}`, {
            method: "POST",
            headers: {
                "Client-Id": config.clientId,
                "Request-Id": requestId,
                "Request-Timestamp": requestTimestamp,
                Signature: signature,
                "Content-Type": "application/json",
            },
            body: payload,
        });

        console.log("[DOKU Raw Response]:", JSON.stringify(response));

        const paymentUrl =
            response?.response?.payment?.url ||
            response?.payment?.url ||
            response?.data?.payment?.url ||
            response?.response?.url ||
            response?.url;

        const dokuReference =
            response?.response?.order?.invoice_number ||
            response?.order?.invoice_number ||
            params.invoiceNumber;

        if (paymentUrl) {
            return {
                success: true,
                paymentUrl,
                dokuReference,
                rawResponse: response,
            };
        }

        return {
            success: false,
            error: response?.message || "Failed to retrieve DOKU payment URL from response",
            rawResponse: response,
        };
    } catch (err: any) {
        const errorDetail =
            err?.data?.error?.message ||
            (Array.isArray(err?.data?.error?.details) ? err.data.error.details.join(", ") : null) ||
            err?.data?.message ||
            err?.message ||
            "Error communicating with DOKU";

        console.error("[DOKU API Error Details]:", JSON.stringify(err?.data || err?.message));

        return {
            success: false,
            error: errorDetail,
            rawResponse: err?.data,
        };
    }
}
