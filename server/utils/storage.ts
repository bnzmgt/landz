export interface Transaction {
    id: string;
    invoiceNumber: string;
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    amount: number;
    quantity?: number;
    paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
    paymentMethod?: string;
    dokuPaymentUrl?: string;
    dokuReference?: string;
    createdAt: string;
    updatedAt: string;
    rawCallbackData?: any;
}

// In-memory fallback for environments where persistent storage driver is not mounted
const memoryStore = new Map<string, Transaction>();

export async function saveTransaction(transaction: Transaction): Promise<void> {
    try {
        const storage = useStorage("data");
        await storage.setItem(`transactions:${transaction.invoiceNumber}`, transaction);
        await storage.setItem(`transactions_by_id:${transaction.id}`, transaction.invoiceNumber);
    } catch {
        // Fallback to memoryStore
    }
    memoryStore.set(transaction.invoiceNumber, transaction);
    memoryStore.set(transaction.id, transaction);
}

export async function getTransactionByInvoice(invoiceNumber: string): Promise<Transaction | null> {
    try {
        const storage = useStorage("data");
        const tx = await storage.getItem<Transaction>(`transactions:${invoiceNumber}`);
        if (tx) return tx;
    } catch {
        // Fallback to memoryStore
    }
    return memoryStore.get(invoiceNumber) || null;
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
    try {
        const storage = useStorage("data");
        const invoiceNumber = await storage.getItem<string>(`transactions_by_id:${id}`);
        if (invoiceNumber) {
            const tx = await storage.getItem<Transaction>(`transactions:${invoiceNumber}`);
            if (tx) return tx;
        }
    } catch {
        // Fallback to memoryStore
    }
    return memoryStore.get(id) || null;
}

export async function updateTransactionStatus(
    invoiceNumber: string,
    status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED",
    extraData?: Partial<Transaction>
): Promise<Transaction | null> {
    const existing = await getTransactionByInvoice(invoiceNumber);
    if (!existing) return null;

    const updated: Transaction = {
        ...existing,
        ...extraData,
        paymentStatus: status,
        updatedAt: new Date().toISOString(),
    };

    await saveTransaction(updated);
    return updated;
}
