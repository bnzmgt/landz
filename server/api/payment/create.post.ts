import { createDokuCheckoutSession } from "../../utils/doku";
import { saveTransaction, type Transaction } from "../../utils/storage";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig(event);

    const {
        productId,
        productName,
        productPrice,
        productImage,
        customerName,
        customerEmail,
        customerPhone,
        quantity = 1,
    } = body || {};

    if (!productName || !productPrice) {
        throw createError({
            statusCode: 400,
            statusMessage: "Product details and price are required",
        });
    }

    // Sanitize numeric amount (parse string like 'Rp49.000' or 49000)
    let numericPrice = typeof productPrice === "number"
        ? productPrice
        : parseInt(String(productPrice).replace(/[^\d]/g, ""), 10);

    if (isNaN(numericPrice) || numericPrice <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid product price",
        });
    }

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);
    const totalAmount = numericPrice * qty;

    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const initialTransaction: Transaction = {
        id,
        invoiceNumber,
        productId: productId || "unknown",
        productName,
        productPrice: numericPrice,
        productImage: productImage || "",
        customerName: customerName || "Pelanggan",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        amount: totalAmount,
        quantity: qty,
        paymentStatus: "PENDING",
        createdAt: now,
        updatedAt: now,
    };

    await saveTransaction(initialTransaction);

    const dokuConfig = {
        clientId: config.dokuClientId,
        secretKey: config.dokuSecretKey,
        environment: config.dokuEnvironment,
        callbackUrl: config.dokuCallbackUrl,
        returnUrl: config.dokuReturnUrl || `/payment/success?invoice=${invoiceNumber}`,
    };

    const validEmail = (customerEmail && customerEmail.includes("@"))
        ? customerEmail.trim()
        : "pembeli@dotuquonline.com";

    const validPhone = (customerPhone || "081234567890").replace(/[^\d]/g, "") || "081234567890";

    const returnUrl = config.dokuReturnUrl && config.dokuReturnUrl.startsWith("https://")
        ? `${config.dokuReturnUrl}?invoice=${invoiceNumber}`
        : `https://dotuquonline.com/payment/success?invoice=${invoiceNumber}`;

    const dokuRes = await createDokuCheckoutSession(dokuConfig, {
        invoiceNumber,
        amount: totalAmount,
        items: [
            {
                name: productName.slice(0, 100),
                price: numericPrice,
                quantity: qty,
            },
        ],
        customer: {
            name: (customerName || "Pelanggan").trim().slice(0, 50),
            email: validEmail,
            phone: validPhone,
        },
        returnUrl,
    });

    if (!dokuRes.success) {
        throw createError({
            statusCode: 502,
            statusMessage: dokuRes.error || "Failed to initiate payment with DOKU",
        });
    }

    // Update stored transaction with DOKU reference & payment URL
    const updatedTransaction: Transaction = {
        ...initialTransaction,
        dokuReference: dokuRes.dokuReference,
        dokuPaymentUrl: dokuRes.paymentUrl,
        updatedAt: new Date().toISOString(),
    };

    await saveTransaction(updatedTransaction);

    return {
        success: true,
        transactionId: id,
        invoiceNumber,
        paymentUrl: dokuRes.paymentUrl,
        isMock: dokuRes.isMock || false,
        amount: totalAmount,
    };
});
