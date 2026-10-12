import {useState} from 'react'
import './CustomerPortal.css'
import App from './App'

type Loan = {
    id: number;
    amount: number;
    interest: number;
    amountRemaining: number;
    dateCreated: string;
    loanDurationYears: number;
};

function CustomerLanding() {
    // button declare to show user info
    const [showUserInfo, setShowUserInfo] = useState(false)
    // portal for logging out
    const [showPortal, setShowPortal] = useState(false)
    //placeholder for selected loan by usre
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    //pre-made Loan[] set to display different methods
    const loans: Loan[] = [
        {id : 1, amount: 15000, interest: 12, amountRemaining: 12000, dateCreated: "2026-08-22", loanDurationYears: 3},
        {id : 2, amount: 20000, interest: 4, amountRemaining: 15000, dateCreated: "2023-05-13", loanDurationYears: 5}
    ];

    // logout handler
    if (showPortal) {
        return <App />
    }
    // loan selector handler
    if (selectedLoan) {
        return <LoanPayment loan={selectedLoan} onBack={() => setSelectedLoan(null)} />;
    }


    return (
        <main>
            <div className="page">
            <h1>Welcome User</h1>

            {/*Button for viewing user info*/}
            <button
                type='button'
                className='button'
                onClick={() => setShowUserInfo(!showUserInfo)}>
                {showUserInfo ? "Hide User Information" : "View User Information"}
            </button>


            {/*Information hidden under button*/}
            {showUserInfo && (
                <section>
                    <h2>User Information</h2>
                    <p>Name: Example</p>
                    <p>Email: user@Example.com</p>

                    {/*Loan Examples*/}
                    {loans.map((loan) => (
                        <LoanInfo
                            key={loan.id}
                            loan={loan}
                            onMakePayment={() => setSelectedLoan(loan)}
                        />
                        ))}
                </section>
            )}

            {/*logout button*/}
            <button
                type='button'
                className = 'button back'
                onClick={() => setShowPortal(true)}>LOG OUT
            </button>
            </div>
        </main>

    )
}


//display page to user displaying selected loan information
function LoanPayment({ loan, onBack }: { loan: Loan; onBack: () => void }) {
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentResult, setPaymentResult] = useState<{ oldLoan: Loan; newLoan: Loan; paymentAmount: number; }
        | null>(null);

    // handler for making a payment
    function handleMakePayment() {
        // values for amount to pay and minimum that can be paid
        const amount = Number(paymentAmount);
        const minimum = calculateMinimumPayment(loan);


        if (
            !Number.isFinite(amount) ||
            amount < minimum ||
            amount > loan.amountRemaining
        ) {
            return;
        }

        const oldLoan = { ...loan };
        const newLoan = {
            ...loan,
            amountRemaining: loan.amountRemaining - amount,
        };

        setPaymentResult({ oldLoan, newLoan, paymentAmount: amount });
    }

    if (paymentResult) {
        return (
            <PaymentSuccess
                oldLoan={paymentResult.oldLoan}
                newLoan={paymentResult.newLoan}
                paymentAmount={paymentResult.paymentAmount}
                onBack={onBack}/>
        );
    }

    return (
        <main>
            <div className='page loanPage'>
            {/*Existing loan details*/}
                <LoanInfo loan = {loan} />
                <label htmlFor="paymentAmount">Payment amount:</label>
                <input
                    id="paymentAmount"
                    type="number"
                    min= {calculateMinimumPayment(loan)}
                    max = {loan.amountRemaining}
                    step = "0.01"
                    value = {paymentAmount}
                    onChange = {(event) => setPaymentAmount(event.currentTarget.value)}
            />
                <button type="button" onClick={handleMakePayment}>
                    Submit Payment
                </button>

                <button
                className='button back'
                onClick={onBack}
                >Back</button>
            </div>
        </main>
    );
}

// returns minimum payment based off of amountReamining and interest
// uses Standard Amortization Formula
function calculateMinimumPayment(loan: Loan): number {
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



//handler for a succesful payment
function PaymentSuccess({oldLoan, newLoan, paymentAmount, onBack} :
                        { oldLoan: Loan; newLoan: Loan; paymentAmount: number; onBack: () => void; }) {
    return(
        <main>
            <div className="page">
                {/*display payment information for old and new loan*/}
                <h1>Payment Succesful!</h1>
                <p>Payment: ${paymentAmount.toFixed(2)}</p>
                <p>Old amount remaining: ${oldLoan.amountRemaining.toFixed(2)}</p>
                <p>New amount remaining: ${newLoan.amountRemaining.toFixed(2)}</p>
                {/*button -> CustomerLanding()*/}
                <button
                    className='button'
                    onClick={onBack}>
                    Back to Menu
                </button>

            </div>
        </main>
    )
}


// Returns informational list of selected Loan
function LoanInfo({loan, onMakePayment,}: { loan: Loan; onMakePayment?: () => void; }) {
    return (

        // returns a box to be displayed
        <div className="loanBox">
            <h1>Loan {loan.id}</h1>
            <p>Loan Amount: ${loan.amount.toLocaleString()}</p>
            <p>Interest: {loan.interest}%</p>
            <p>Amount Remaining: ${loan.amountRemaining.toLocaleString()}</p>
            <p>Loan Duration: {loan.loanDurationYears}</p>
            <p>Date loan was created: {loan.dateCreated}</p>

            {/*Payment button for selected loan*/}
            {onMakePayment && (
                <button className="payment" onClick={onMakePayment}>
                    Make a Payment
                </button>
            )}
        </div>
    );
}

export default CustomerLanding
