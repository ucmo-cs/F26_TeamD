import {useEffect, useState, type FormEvent} from "react"
import "./CustomerPortal.css"
import "./AdminPortal.css"
import App from "./App"
import {formatLoanDate} from "./LoanControler/LoanService.tsx";

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

// front-end shape used by the table
type UnpaidLoan = {
    id: number;
    customerName: string;
    customerEmail: string;
    amount: number;
    interest: number;
    amountRemaining: number;
    loanDurationYears: number;
    dateCreated: string;
};

function toUnpaidLoan(loan: ApiUnpaidLoan): UnpaidLoan {
    return {
        id: loan.loanId,
        customerName: loan.customer.name,
        customerEmail: loan.customer.email,
        amount: Number(loan.originalAmount),
        interest: Number(loan.interestRate) * 100,
        amountRemaining: Number(loan.remainingBalance),
        loanDurationYears: loan.loanTermMonths / 12,
        dateCreated: loan.loanDate,
    };
}

async function getUnpaidLoans(): Promise<UnpaidLoan[]> {
    const response = await fetch(`${ADMIN_API_URL}/unpaid-loans`);
    if (!response.ok) throw new Error("Could not load unpaid loans");
    const loans: ApiUnpaidLoan[] = await response.json();
    return loans.map(toUnpaidLoan);
}

function AdminLanding({adminName}: {adminName: string}) {
    const [showHomePage, setShowHomePage] = useState(false)
    const [loans, setLoans] = useState<UnpaidLoan[]>([])
    const [loading, setLoading] = useState(true)
    const [loanLoadError, setLoanLoadError] = useState("")
    const [showNewLoanForm, setShowNewLoanForm] = useState(false)
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
                                <th>Interest</th>
                                <th>Outstanding<br />Balance</th>
                                <th>Duration<br />(years)</th>
                                <th>Date Created</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.id}>
                                    <td>{loan.customerName}</td>
                                    <td>{loan.customerEmail}</td>
                                    <td>${loan.amount.toLocaleString()}</td>
                                    <td>{loan.interest}%</td>
                                    <td>${loan.amountRemaining.toLocaleString()}</td>
                                    <td>{loan.loanDurationYears}</td>
                                    <td>{formatLoanDate(loan.dateCreated)}</td>
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
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [amount, setAmount] = useState("")
    const [interestPercent, setInterestPercent] = useState("")
    const [termMonths, setTermMonths] = useState("")
    const [loanDate, setLoanDate] = useState(todayIso())
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

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
            const response = await fetch(`${ADMIN_API_URL}/create-loan`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    customer: {
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim() || null,
                    },
                    loan: {
                        loanDate,
                        originalAmount: Math.round(originalAmount * 100) / 100,
                        // a brand-new loan has nothing paid yet
                        remainingBalance: Math.round(originalAmount * 100) / 100,
                        interestRate,
                        loanTermMonths,
                    },
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
                        Create a customer and their loan. Login details are emailed to the customer.
                    </p>

                    <form className="customer-info-form" onSubmit={handleSubmit}>
                        <label htmlFor="newName">Customer name</label>
                        <input id="newName" type="text" value={name} required
                               onChange={(event) => setName(event.currentTarget.value)} />

                        <label htmlFor="newEmail">Email</label>
                        <input id="newEmail" type="email" value={email} required
                               onChange={(event) => setEmail(event.currentTarget.value)} />

                        <label htmlFor="newPhone">Phone (optional)</label>
                        <input id="newPhone" type="tel" value={phone}
                               onChange={(event) => setPhone(event.currentTarget.value)} />

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
