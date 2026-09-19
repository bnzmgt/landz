import { getTransactionByInvoice, getTransactionById, updateTransactionStatus } from "../../utils/storage";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const invoice = query.invoice as string;
    const id = query.id as string;
    const action = query.action as string;

    if (!invoice && !id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Query parameter 'invoice' or 'id' is required",
        });
    }

    let transaction = invoice
        ? await getTransactionByInvoice(invoice)
        : await getTransactionById(id);

    if (!transaction) {
        throw createError({
            statusCode: 404,
            statusMessage: "Transaction not found",
        });
    }

    // Allow mock/sandbox simulation for local testing
    if (action === "simulate_success" && transaction.paymentStatus === "PENDING") {
        transaction = await updateTransactionStatus(transaction.invoiceNumber, "SUCCESS", {
            paymentMethod: "DOKU_SANDBOX_MOCK",
        });
    } else if (action === "simulate_failed" && transaction.paymentStatus === "PENDING") {
        transaction = await updateTransactionStatus(transaction.invoiceNumber, "FAILED", {
            paymentMethod: "DOKU_SANDBOX_MOCK",
        });
    }

    return {
        success: true,
        transaction,
    };
});
