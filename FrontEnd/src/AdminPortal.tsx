import {useEffect, useState, type FormEvent} from "react"
import "./CustomerPortal.css"
import "./AdminPortal.css"
import App from "./App"
import {
    calculateMinimumPayment,
    formatLoanDate,
    processPayment,
    type Loan,
    type PaymentFrequency,
} from "./LoanControler/LoanService.tsx";

const ADMIN_API_URL = "http://localhost:8081/api/admin";

// shape of a loan as returned by GET /api/admin/unpaid-loans
type ApiUnpaidLoan = {
    loanId: number;
    customer: { customerId: number; name: string; email: string };
    originalAmount: number;
    remainingBalance: number;
    interestRate: number;
    loanDate: string;
    loanTermMonths: number;
};

type ApiSchedule = {
    loan: { loanId: number };
    frequency: string;
};

// front-end shape used by the table
type UnpaidLoan = {
    id: number;
    customerId: number;
    customerName: string;
    customerEmail: string;
    amount: number;
    interest: number;
    amountRemaining: number;
    loanDurationYears: number;
    paymentFrequency: string;
    dateCreated: string;
};

type ExistingCustomer = {
    customerId: number;
    name: string;
    email: string;
};

function toUnpaidLoan(loan: ApiUnpaidLoan, schedule?: ApiSchedule): UnpaidLoan {
    const frequency = schedule?.frequency.toUpperCase();
    return {
        id: loan.loanId,
        customerId: loan.customer.customerId,
        customerName: loan.customer.name,
        customerEmail: loan.customer.email,
        amount: Number(loan.originalAmount),
        interest: Number(loan.interestRate) * 100,
        amountRemaining: Number(loan.remainingBalance),
        loanDurationYears: loan.loanTermMonths / 12,
        paymentFrequency: frequency === "WEEKLY" ? "Weekly"
            : frequency === "BIWEEKLY" ? "Bi-weekly"
                : frequency === "MONTHLY" ? "Monthly" : "Unscheduled",
        dateCreated: loan.loanDate,
    };
}

// convert a table row into the Loan shape the shared payment functions expect
function toPaymentLoan(loan: UnpaidLoan): Loan {
    const frequency: PaymentFrequency = loan.paymentFrequency === "Weekly" ? "weekly"
        : loan.paymentFrequency === "Bi-weekly" ? "biweekly"
            : loan.paymentFrequency === "Monthly" ? "monthly" : "unscheduled";
    return {
        id: loan.id,
        customerId: loan.customerId,
        amount: loan.amount,
        interest: loan.interest,
        amountRemaining: loan.amountRemaining,
        dateCreated: loan.dateCreated,
        loanDurationYears: loan.loanDurationYears,
        paymentFrequency: frequency,
    };
}

async function getUnpaidLoans(): Promise<UnpaidLoan[]> {
    const response = await fetch(`${ADMIN_API_URL}/unpaid-loans`);
    if (!response.ok) throw new Error("Could not load unpaid loans");
    const loans: ApiUnpaidLoan[] = await response.json();
    const customerIds = [...new Set(loans.map((loan) => loan.customer.customerId))];
    const schedulesByCustomer = await Promise.all(customerIds.map(async (customerId) => {
        const scheduleResponse = await fetch(`http://localhost:8081/api/payment-schedules/customer/${customerId}`);
        if (!scheduleResponse.ok) throw new Error("Could not load payment frequencies");
        return await scheduleResponse.json() as ApiSchedule[];
    }));
    const schedules = schedulesByCustomer.flat();
    return loans.map((loan) => toUnpaidLoan(
        loan,
        schedules.find((schedule) => schedule.loan.loanId === loan.loanId),
    ));
}

function AdminLanding({adminName}: {adminName: string}) {
    const [showHomePage, setShowHomePage] = useState(false)
    const [loans, setLoans] = useState<UnpaidLoan[]>([])
    const [loading, setLoading] = useState(true)
    const [loanLoadError, setLoanLoadError] = useState("")
    const [showNewLoanForm, setShowNewLoanForm] = useState(false)
    // the loan the admin is making a payment on (null = show the table)
    const [payingLoan, setPayingLoan] = useState<UnpaidLoan | null>(null)
    // bump this to re-fetch loans (e.g. after creating a loan)
    const [loanReloadKey, setLoanReloadKey] = useState(0)

    useEffect(() => {
        getUnpaidLoans()
            .then((data) => {
                setLoans(data);
                setLoanLoadError("");
            })
            .catch((error: unknown) => {
                setLoanLoadError(error instanceof Error ? error.message : "Could not load unpaid loans");
            })
            .finally(() => setLoading(false));
    }, [loanReloadKey]);

    // logout handler
    if (showHomePage){
        return <App />
    }

    if (showNewLoanForm) {
        return (
            <NewLoanForm
                onBack={() => setShowNewLoanForm(false)}
                onCreated={() => {
                    setShowNewLoanForm(false);
                    setLoanReloadKey((key) => key + 1); // show the new loan
                }}
            />
        )
    }

    if (payingLoan) {
        return (
            <AdminPaymentForm
                loan={payingLoan}
                onBack={() => setPayingLoan(null)}
                onPaid={() => {
                    setPayingLoan(null);
                    setLoanReloadKey((key) => key + 1); // show the new balance
                }}
            />
        )
    }

    return (
        <main>
            <div className="page customerPortalPage">
                {/*welcome message for the admin*/}
                <p className="customerName">Welcome {adminName}</p>

                {/*open the form to create a new customer and loan*/}
                <button
                    type="button"
                    className="button adminNewLoan"
                    onClick={() => setShowNewLoanForm(true)}>
                    New Loan
                </button>

                <section>
                    {loanLoadError && <p role="alert" className="customer-error">{loanLoadError}</p>}
                    {loading && <p className="adminStatus">Loading loans...</p>}
                    {!loading && !loanLoadError && loans.length === 0 && (
                        <p className="adminStatus">There are no unpaid loans.</p>
                    )}

                    {loans.length > 0 && (
                        <table className="loanTable">
                            <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Loan Amount</th>
                                <th>Outstanding<br />Balance</th>
                                <th>Interest</th>
                                <th>Duration<br />(years)</th>
                                <th>Payment <br /> Frequency</th>
                                <th>Date Created</th>
                                <th>Payment</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.id}>
                                    <td>{loan.customerName}</td>
                                    <td>{loan.customerEmail}</td>
                                    <td>${loan.amount.toLocaleString()}</td>
                                    <td>${loan.amountRemaining.toLocaleString()}</td>
                                    <td>{loan.interest}%</td>
                                    <td>{loan.loanDurationYears}</td>
                                    <td>{loan.paymentFrequency}</td>
                                    <td>{formatLoanDate(loan.dateCreated)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="adminPayButton"
                                            onClick={() => setPayingLoan(loan)}>
                                            Pay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/*logout button*/}
                <button
                    type="button"
                    className="button back"
                    onClick={() => setShowHomePage(true)}>
                    Return To Main Menu
                </button>
            </div>
        </main>
    )
}

// Lets an admin make a payment on a customer's loan.
// Uses the same rules and endpoint as the customer's own payment pop-up.
function AdminPaymentForm({loan, onBack, onPaid}: { loan: UnpaidLoan; onBack: () => void; onPaid: () => void }) {
    const paymentLoan = toPaymentLoan(loan)
    const minimum = calculateMinimumPayment(paymentLoan)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<{ amount: number; newBalance: number } | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError("")
        const amount = Number(paymentAmount)

        setSubmitting(true)
        try {
            const updated = await processPayment(paymentLoan, amount)
            setResult({amount, newBalance: updated.amountRemaining})
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment failed")
        } finally {
            setSubmitting(false)
        }
    }

    if (result) {
        return (
            <main>
                <h1>Payment Successful!</h1>
                <div className="paymentSuccess">
                    <p><span>Customer</span><strong>{loan.customerName}</strong></p>
                    <p><span>Payment made</span><strong>${result.amount.toFixed(2)}</strong></p>
                    <p><span>Previous balance</span><strong>${loan.amountRemaining.toFixed(2)}</strong></p>
                    <p><span>New balance</span><strong>${result.newBalance.toFixed(2)}</strong></p>
                    <button type="button" className="button" onClick={onPaid}>
                        Back to Loans
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main>
            <div className="page loanPage">
                <div className="loanBox">
                    <h1>Payment for {loan.customerName}</h1>
                    <p><span>Email</span><strong>{loan.customerEmail}</strong></p>
                    <p><span>Loan amount</span><strong>${loan.amount.toLocaleString()}</strong></p>
                    <p><span>Interest rate</span><strong>{loan.interest}%</strong></p>
                    <p><span>Amount remaining</span><strong>${loan.amountRemaining.toLocaleString()}</strong></p>
                    <p><span>Payment frequency</span><strong>{loan.paymentFrequency}</strong></p>
                    <p><span>Opened</span><strong>{formatLoanDate(loan.dateCreated)}</strong></p>
                </div>

                <form className="customer-payment" onSubmit={handleSubmit}>
                    <label htmlFor="adminPaymentAmount">Payment amount</label>
                    <div className="customer-payment-row">
                        <input
                            id="adminPaymentAmount"
                            type="number"
                            min={minimum}
                            max={loan.amountRemaining}
                            step="0.01"
                            required
                            value={paymentAmount}
                            placeholder={`Min $${minimum.toFixed(2)}`}
                            onChange={(event) => setPaymentAmount(event.currentTarget.value)}
                        />
                        <button
                            type="button"
                            className="customer-minimum"
                            onClick={() => setPaymentAmount(minimum.toFixed(2))}>
                            Use minimum
                        </button>
                        <button type="submit" className="payment" disabled={submitting}>
                            {submitting ? "Processing..." : "Submit Payment"}
                        </button>
                    </div>
                </form>

                {error && <p role="alert" className="customer-error">{error}</p>}

                <button type="button" className="button back" onClick={onBack}>
                    Back
                </button>
            </div>
        </main>
    )
}

// today's date as YYYY-MM-DD (local time) for the date input default
function todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

// Form for POST /api/admin/create-loan: creates a new customer and their first loan.
// The backend generates the customer's temporary password and emails it to them.
function NewLoanForm({onBack, onCreated}: { onBack: () => void; onCreated: () => void }) {
    const [customerMode, setCustomerMode] = useState<"new" | "existing">("new")
    const [customers, setCustomers] = useState<ExistingCustomer[]>([])
    const [customerLoadError, setCustomerLoadError] = useState("")
    const [customerId, setCustomerId] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [amount, setAmount] = useState("")
    const [interestPercent, setInterestPercent] = useState("")
    const [termMonths, setTermMonths] = useState("")
    const [loanDate, setLoanDate] = useState(todayIso())
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetch(`${ADMIN_API_URL}/customers`)
            .then(async (response) => {
                if (!response.ok) throw new Error("Could not load customers")
                return response.json() as Promise<ExistingCustomer[]>
            })
            .then((data) => {
                setCustomers(data)
                setCustomerLoadError("")
            })
            .catch((loadError: unknown) => {
                setCustomerLoadError(loadError instanceof Error ? loadError.message : "Could not load customers")
            })
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError("")

        const originalAmount = Number(amount)
        const interestRate = Number(interestPercent) / 100
        const loanTermMonths = Number(termMonths)

        if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
            setError("Loan amount must be greater than zero")
            return
        }
        if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 1) {
            setError("Interest rate must be between 0% and 100%")
            return
        }
        if (!Number.isInteger(loanTermMonths) || loanTermMonths <= 0) {
            setError("Loan term must be a whole number of months greater than zero")
            return
        }

        setSubmitting(true)
        try {
            const loan = {
                loanDate,
                originalAmount: Math.round(originalAmount * 100) / 100,
                remainingBalance: Math.round(originalAmount * 100) / 100,
                interestRate,
                loanTermMonths,
            }
            const isNewCustomer = customerMode === "new"
            if (!isNewCustomer && !customerId) {
                setError("Select a customer first")
                return
            }

            const response = await fetch(isNewCustomer ? `${ADMIN_API_URL}/create-loan` : "http://localhost:8081/api/loans", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(isNewCustomer ? {
                    customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || null },
                    loan,
                } : {
                    customer: { customerId: Number(customerId) },
                    ...loan,
                }),
            })
            if (!response.ok) {
                const body = await response.json().catch(() => null) as { message?: string } | null
                throw new Error(body?.message || "Could not create the loan")
            }
            onCreated()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create the loan")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main>
            <div className="page customer-info-page">
                <section className="customer-info-card">
                    <h1>New Loan</h1>
                    <p className="customer-info-intro">
                        Create a loan for a new or existing customer.
                    </p>

                    <form className="customer-info-form" onSubmit={handleSubmit}>
                        <label htmlFor="customerMode">Customer</label>
                        <select id="customerMode" value={customerMode}
                                onChange={(event) => setCustomerMode(event.currentTarget.value as "new" | "existing")}>
                            <option value="new">Create a new customer</option>
                            <option value="existing">Select an existing customer</option>
                        </select>

                        {customerMode === "new" ? <>
                            <label htmlFor="newName">Customer name</label>
                            <input id="newName" type="text" value={name} required
                                   onChange={(event) => setName(event.currentTarget.value)} />
                            <label htmlFor="newEmail">Email</label>
                            <input id="newEmail" type="email" value={email} required
                                   onChange={(event) => setEmail(event.currentTarget.value)} />
                            <label htmlFor="newPhone">Phone (optional)</label>
                            <input id="newPhone" type="tel" value={phone}
                                   onChange={(event) => setPhone(event.currentTarget.value)} />
                        </> : <>
                            <label htmlFor="existingCustomer">Existing customer</label>
                            <select id="existingCustomer" value={customerId} required
                                    onChange={(event) => setCustomerId(event.currentTarget.value)}>
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.customerId} value={customer.customerId}>
                                        {customer.name} ({customer.email})
                                    </option>
                                ))}
                            </select>
                            {customerLoadError && <p role="alert" className="customer-info-status adminFormError">{customerLoadError}</p>}
                        </>}

                        <label htmlFor="newAmount">Loan amount ($)</label>
                        <input id="newAmount" type="number" min="0.01" step="0.01" value={amount} required
                               onChange={(event) => setAmount(event.currentTarget.value)} />

                        <label htmlFor="newInterest">Interest rate (%)</label>
                        <input id="newInterest" type="number" min="0" max="100" step="0.01"
                               value={interestPercent} required placeholder="e.g. 6.5"
                               onChange={(event) => setInterestPercent(event.currentTarget.value)} />

                        <label htmlFor="newTerm">Loan term (months)</label>
                        <input id="newTerm" type="number" min="1" step="1" value={termMonths} required
                               onChange={(event) => setTermMonths(event.currentTarget.value)} />

                        <label htmlFor="newDate">Loan date</label>
                        <input id="newDate" type="date" value={loanDate} required
                               onChange={(event) => setLoanDate(event.currentTarget.value)} />

                        {error && <p role="alert" className="customer-info-status adminFormError">{error}</p>}

                        <div className="customer-info-actions">
                            <button type="submit" className="customer-info-submit" disabled={submitting}>
                                {submitting ? "Creating..." : "Create Loan"}
                            </button>
                            <button type="button" className="customer-info-cancel" onClick={onBack}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}

export default AdminLanding
