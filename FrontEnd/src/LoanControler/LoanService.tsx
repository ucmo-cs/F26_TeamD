// Service file for CustomerPortal.tsx


type PaymentFrequency = "weekly" | "biweekly" | "monthly" | "unscheduled";
export type Loan = {
    id: number;
    customerId: number;
    amount: number;
    interest: number;
    amountRemaining: number;
    dateCreated: string;
    loanDurationYears: number;
    paymentFrequency: PaymentFrequency;
};

const API_URL = "http://localhost:8081/api";
type ApiLoan = {
    loanId: number;
    customer: { customerId: number};
    originalAmount: number;
    remainingBalance: number;
    interestRate: number;
    loanDate: string;
    loanTermMonths: number;
};
type ApiPaymentSchedule = {
    loan: { loanId: number };
    frequency: string;
};

// convert a backend loan (+ its schedule, if any) into the front-end Loan shape
function toLoan(loan: ApiLoan, schedule: ApiPaymentSchedule | undefined): Loan {
    const frequency = schedule?.frequency.toLowerCase();
    const paymentFrequency: PaymentFrequency =
        frequency === "weekly" || frequency === "biweekly" || frequency === "monthly"
            ? frequency
            : "unscheduled";

    return {
        id: loan.loanId,
        customerId: loan.customer.customerId,
        amount: Number(loan.originalAmount),
        amountRemaining: Number(loan.remainingBalance),
        interest: Number(loan.interestRate) * 100,
        dateCreated: loan.loanDate,
        loanDurationYears: loan.loanTermMonths / 12,
        paymentFrequency,
    };
}

// export and return one customer's loans to front-end
// (two requests total: the customer's loans and the customer's payment schedules)
export async function getLoansForCustomer(customerId: number): Promise<Loan[]> {
    const [loanResponse, scheduleResponse] = await Promise.all([
        fetch(`${API_URL}/loans/customer/${customerId}`),
        fetch(`${API_URL}/payment-schedules/customer/${customerId}`),
    ]);
    if (!loanResponse.ok) throw new Error("Could not load loans");
    if (!scheduleResponse.ok) throw new Error("Could not load payment schedules");

    const apiLoans: ApiLoan[] = await loanResponse.json();
    const schedules: ApiPaymentSchedule[] = await scheduleResponse.json();

    return apiLoans.map((loan) =>
        toLoan(loan, schedules.find((schedule) => schedule.loan.loanId === loan.loanId)));
}



// returns minimum payment based off of amountReamining and interest
// uses Standard Amortization Formula
export function calculateMinimumPayment(loan: Loan): number {
    //get percentile of monthly interest and amount of months to pay
    const monthlyRate = loan.interest / 100 / 12;
    const numberOfPayments = loan.loanDurationYears * 12

    if (numberOfPayments <= 0) return 0;

    if (monthlyRate === 0) {
        return loan.amountRemaining / numberOfPayments;
    }
    const factor = (1 + monthlyRate) ** numberOfPayments;

    //return value at 2 decimal point value
    return Math.round((loan.amountRemaining * monthlyRate * factor) / (factor - 1) * 100) / 100;
}

// keep payment process out of front-end
// validates on the front-end first (including the minimum payment),
// then sends the payment to the backend, which subtracts it and saves the new balance
export async function processPayment(loan: Loan, amount: number): Promise<Loan> {
    validatePayment(loan, amount);

    const response = await fetch(`${API_URL}/loans/${loan.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(amount * 100) / 100 }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(error?.message || "Payment failed. Please try again.");
    }

    const updated: ApiLoan = await response.json();
    return { ...loan, amountRemaining: Number(updated.remainingBalance) };
}

// throws an Error with a user-facing message if the payment isn't allowed
function validatePayment(loan: Loan, amount: number): void {
    const minimum = calculateMinimumPayment(loan);

    if (loan.amountRemaining > loan.amount) {
        throw new Error("Amount remaining cannot be greater than the original loan amount");
    }

    // check if loan is valid
    if (!validLoan(loan)) {
        throw new Error("Loan details are invalid. Please contact customer support.");
    }
    // calculate the minimum
    if (
        !Number.isFinite(amount) ||
        amount < minimum ||
        amount > loan.amountRemaining) {
        throw new Error("Payment must be between the minimum and remaining balance");
    }
}


// Boolean functions to test if loan is valid
function validRemainingBalance(loan: Loan): boolean {
    if (0 < loan.amountRemaining && loan.amountRemaining <= loan.amount)
        return true;
    else {
        console.log("amountRemaining less than 0 or above loan amount")
        return false;
    }}
function validInterest(loan : Loan): boolean {
    if (loan.interest < 0) {
        console.log("Interest below zero")
        return false;
    } else if (loan.interest == 0) { //some loans have interest of 0
        console.log("Interest is zero")
        return true;
    } else return true;
}
function validLoanAmount(loan : Loan): boolean {
    if (loan.amount > 0)
        return true;
    else {
        console.log("loan amount below 0")
        return false;
    }
}
function validLoanDuration(loan : Loan): boolean {
    if (loan.loanDurationYears > 0) {
        return true;
    } else {
        console.log("loanDurationYears is invalid")
        return false;
    }
}
function isLoanPayable(loan : Loan): boolean {
    if (loan.amountRemaining > 0) {
        return true;
    } else {
        console.log("loan is not above 0")
        return false;
    }
}
export function formatLoanDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// use all validation functions as one bool response
function validLoan(l : Loan): boolean {
    return validRemainingBalance(l) && validLoanAmount(l) && validLoanDuration(l)
        && validInterest(l) && isLoanPayable(l)
}
