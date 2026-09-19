import { getTransactionByInvoice, getTransactionById, updateTransactionStatus, saveTransaction, Transaction } from "../../utils/storage";
import { checkDokuOrderStatus, DokuConfig } from "../../utils/doku";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const invoice = (query.invoice as string) || "";
    const id = (query.id as string) || "";
    const action = query.action as string;

    if (!invoice && !id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Query parameter 'invoice' or 'id' is required",
        });
    }

    const config = useRuntimeConfig(event);
    const cfEnv = (event.context as any)?.cloudflare?.env || {};
    const dokuConfig: DokuConfig = {
        clientId: config.dokuClientId || cfEnv.DOKU_CLIENT_ID || cfEnv.NUXT_DOKU_CLIENT_ID || process.env.DOKU_CLIENT_ID || "",
        secretKey: config.dokuSecretKey || cfEnv.DOKU_SECRET_KEY || cfEnv.NUXT_DOKU_SECRET_KEY || process.env.DOKU_SECRET_KEY || "",
        environment: config.dokuEnvironment || cfEnv.DOKU_ENVIRONMENT || cfEnv.NUXT_DOKU_ENVIRONMENT || process.env.DOKU_ENVIRONMENT || "production",
    };

    let transaction = invoice
        ? await getTransactionByInvoice(invoice)
        : await getTransactionById(id);

    const targetInvoice = transaction?.invoiceNumber || invoice;

    // 1. Live status check with DOKU API if credentials are available
    if (targetInvoice && dokuConfig.clientId && dokuConfig.secretKey) {
        try {
            const dokuResult = await checkDokuOrderStatus(dokuConfig, targetInvoice);
            if (dokuResult.status !== "UNKNOWN") {
                if (transaction) {
                    transaction = await updateTransactionStatus(targetInvoice, dokuResult.status, {
                        paymentMethod: dokuResult.paymentMethod || transaction.paymentMethod,
                        amount: dokuResult.amount || transaction.amount,
                    });
                } else {
                    // Reconstruct transaction if worker isolate was recycled
                    transaction = {
                        id: `tx_${Date.now()}_restored`,
                        invoiceNumber: targetInvoice,
                        productId: "baju-batik-wanita-modern-single-price-test",
                        productName: "Baju Batik Wanita Modern Atasan Remaja",
                        productPrice: dokuResult.amount || 10000,
                        amount: dokuResult.amount || 10000,
                        quantity: 1,
                        paymentStatus: dokuResult.status,
                        paymentMethod: dokuResult.paymentMethod,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    await saveTransaction(transaction);
                }
            }
        } catch (err) {
            console.warn("[Status Handler] DOKU live check skipped:", err);
        }
    }

    // 2. Fallback heuristic: Check invoice timestamp for auto-expiration (default 60 mins)
    if (!transaction && targetInvoice) {
        const match = targetInvoice.match(/^INV-(\d+)-/);
        const createdAtMs = match ? parseInt(match[1], 10) : 0;
        const isExpired = createdAtMs > 0 && Date.now() - createdAtMs > 60 * 60 * 1000;

        transaction = {
            id: `tx_${Date.now()}_fallback`,
            invoiceNumber: targetInvoice,
            productId: "baju-batik-wanita-modern-single-price-test",
            productName: "Baju Batik Wanita Modern Atasan Remaja",
            productPrice: 10000,
            amount: 10000,
            quantity: 1,
            paymentStatus: isExpired ? "EXPIRED" : "PENDING",
            createdAt: createdAtMs > 0 ? new Date(createdAtMs).toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await saveTransaction(transaction);
    } else if (transaction && transaction.paymentStatus === "PENDING") {
        const match = targetInvoice.match(/^INV-(\d+)-/);
        const createdAtMs = match ? parseInt(match[1], 10) : (transaction.createdAt ? new Date(transaction.createdAt).getTime() : 0);
        if (createdAtMs > 0 && Date.now() - createdAtMs > 60 * 60 * 1000) {
            transaction = await updateTransactionStatus(targetInvoice, "EXPIRED");
        }
    }

    // 3. Allow mock/sandbox simulation for local testing
    if (transaction && action === "simulate_success" && transaction.paymentStatus === "PENDING") {
        transaction = await updateTransactionStatus(transaction.invoiceNumber, "SUCCESS", {
            paymentMethod: "DOKU_SANDBOX_MOCK",
        });
    } else if (transaction && action === "simulate_failed" && transaction.paymentStatus === "PENDING") {
        transaction = await updateTransactionStatus(transaction.invoiceNumber, "FAILED", {
            paymentMethod: "DOKU_SANDBOX_MOCK",
        });
    }

    return {
        success: true,
        transaction,
    };
});
