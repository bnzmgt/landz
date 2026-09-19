import { verifyDokuSignature } from "../../utils/doku";
import { getTransactionByInvoice, updateTransactionStatus } from "../../utils/storage";

export default defineEventHandler(async (event) => {
    const rawBody = await readRawBody(event);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const config = useRuntimeConfig(event);

    const headers = getHeaders(event);
    const clientId = headers["client-id"] || "";
    const requestId = headers["request-id"] || "";
    const requestTimestamp = headers["request-timestamp"] || "";
    const signature = headers["signature"] || "";
    const requestTarget = getRequestPath(event);

    // If secret key is configured, verify HMAC signature
    if (config.dokuSecretKey && config.dokuSecretKey !== "YOUR_DOKU_SECRET_KEY") {
        const isValid = verifyDokuSignature({
            clientId,
            secretKey: config.dokuSecretKey,
            requestId,
            requestTimestamp,
            requestTarget,
            signature,
            rawBody: rawBody || "",
        });

        if (!isValid) {
            throw createError({
                statusCode: 401,
                statusMessage: "Invalid DOKU notification signature",
            });
        }
    }

    // Extract invoice number and status from DOKU webhook body
    const invoiceNumber = body?.order?.invoice_number || body?.invoice_number || body?.invoiceNumber;
    const rawStatus = (
        body?.transaction?.status ||
        body?.transaction_status ||
        body?.status ||
        "SUCCESS"
    ).toUpperCase();

    if (!invoiceNumber) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invoice number is missing in notification",
        });
    }

    let status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" = "PENDING";
    if (rawStatus === "SUCCESS" || rawStatus === "COMPLETED" || rawStatus === "PAID") {
        status = "SUCCESS";
    } else if (rawStatus === "EXPIRED") {
        status = "EXPIRED";
    } else if (rawStatus === "FAILED" || rawStatus === "REJECTED") {
        status = "FAILED";
    }

    const paymentMethod = body?.channel?.id || body?.payment?.payment_method_type || body?.payment_type;

    const updated = await updateTransactionStatus(invoiceNumber, status, {
        paymentMethod,
        rawCallbackData: body,
    });

    if (!updated) {
        // Invoice might have been created externally or in a different session
        console.warn(`[DOKU Callback] Transaction not found for invoice: ${invoiceNumber}`);
    }

    return {
        status: "SUCCESS",
        message: `Notification processed for ${invoiceNumber}`,
    };
});
