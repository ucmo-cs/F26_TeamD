import {useEffect, useState} from 'react'
import './CustomerPortal.css'
import ChangeCustomerInfoPortal from './ChangeCustomerInfoPortal'
import App from './App.tsx'
import {getLoans} from "./LoanControler/LoanService.tsx";
import type {Loan} from "./LoanControler/LoanService.tsx";
import { calculateMinimumPayment} from "./LoanControler/LoanService.tsx"
import { processPayment } from "./LoanControler/LoanService.tsx";
import { formatLoanDate} from "./LoanControler/LoanService.tsx";

type Customer = {
    customerId: number;
    name: string;
    email: string;
    phone: string | null;
};
const CUSTOMER_API_URL = "http://localhost:8081/api/customers";


function CustomerLanding({customerId}: {customerId: number}) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loanLoadError, setLoanLoadError] = useState("");
    const [customerLoadError, setCustomerLoadError] = useState("");
    const [showUserInfo, setShowUserInfo] = useState(true)
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [showPortal, setShowPortal] = useState(false)
    const [showInfoChangePortal, setShowInfoChangePortal] = useState(false);
    const customer = customers.find((account) => account.customerId === customerId);

    useEffect(() => {
        fetch(CUSTOMER_API_URL)
            .then((response) => {
                if (!response.ok) throw new Error("Could not load customers");
                return response.json() as Promise<Customer[]>;
            })
            .then((data) => {
                setCustomers(data);
            })
            .catch((error: unknown) => {
                setCustomerLoadError(error instanceof Error ? error.message : "Could not load customers");
            });

        getLoans()
            .then(setLoans)
            .catch((error: unknown) => {
                setLoanLoadError(error instanceof Error ? error.message : "Could not load loans");
            });
    }, []);
    // const [loanId, setLoanId] = useState("");
    // const [foundLoan, setFoundLoan] = useState<Loan | undefined>();
    //pre-made Loan[] set to display different methods

    // logout handler
    if (showPortal) {
        return <App />
    }
    if(showInfoChangePortal){
        return (
            <ChangeCustomerInfoPortal
            onBack={() => setShowInfoChangePortal(false)}
            />
        )
    }
    if (selectedLoan) {
        return (
            <LoanPayment
                loan={selectedLoan}
                onBack={() => setSelectedLoan(null)}/>);
    }
    return (
        <main>
            <div className="page customerPortalPage">
                {/*welcome message for selected customer*/}
                <p className="customerName">Welcome {customer?.name ?? "Customer"}</p>



                {/*Show and hide the customer's loans*/}
                <button
                    type='button'
                    className='button'
                    onClick={() => setShowUserInfo(!showUserInfo)}>
                    {showUserInfo ? "Hide Loans" : "Show Loans"}
                </button>



                {/*Information hidden under button*/}
                {showUserInfo && (
                    <section>

                        {customerLoadError && <p role="alert">{customerLoadError}</p>}
                        {loanLoadError && <p role="alert">{loanLoadError}</p>}

                        <table className="loanTable">
                            <thead>
                            <tr>
                                <th>Loan Amount</th>
                                <th>Interest</th>
                                <th>Outstanding<br />Balance</th>
                                <th>Duration<br />(years)</th>
                                <th>Payment Frequency</th>
                                <th>Date Created</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loans.filter((loan) => loan.customerId === customerId && loan.amountRemaining > 0).map((loan) => (
                                <tr key={loan.id}>
                                    <td>${loan.amount.toLocaleString()}</td>
                                    <td>{loan.interest}%</td>
                                    <td>${loan.amountRemaining.toLocaleString()}</td>
                                    <td>{loan.loanDurationYears}</td>
                                    <td>{loan.paymentFrequency}</td>
                                    <td>{formatLoanDate(loan.dateCreated)}</td>
                                    <td>
                                        <button className="payment" onClick={() => setSelectedLoan(loan)}>
                                            Make a Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                    </section>
                )}


                {/*<label htmlFor="loanId">Find loan by ID:</label>*/}
                {/*<input*/}
                {/*    id="loanId"*/}
                {/*    type="number"*/}
                {/*    value={loanId}*/}
                {/*    onChange={event => {*/}
                {/*        const value = event.currentTarget.value;*/}
                {/*        setLoanId(value);*/}
                {/*        setFoundLoan(value ? findLoanById(Number(value)) : undefined);*/}
                {/*    }}*/}
                {/*/>*/}
                {/*{loanId && !foundLoan && <p role="status">No loan found with that ID.</p>}*/}
                {/*{foundLoan && <LoanInfo loan={foundLoan} onMakePayment={() => setSelectedLoan(foundLoan)} />}*/}


                {/*logout button*/}
                <button
                    type='button'
                    className = 'button back'
                    onClick={() => setShowPortal(true)}>Return To Main Menu
                </button>
                {/*User Information show/hide*/}
                <button
                    type='button'
                    className='button'
                    onClick={() => setShowInfoChangePortal(true)}
                    >
                        Change User Information
                </button>
                {customer && showInfoChangePortal && (
                    <section className="userInfoPanel">
                        <h2>Customer Information</h2>
                        <p>Customer ID: {customer.customerId}</p>
                        <p>Name: {customer.name}</p>
                        <p>Email: {customer.email}</p>
                        <p>Phone: {customer.phone ?? "Not provided"}</p>
                    </section>
                )}
            </div>
        </main>
    )
}



//display page to user displaying selected loan information
function LoanPayment({ loan, onBack }: { loan: Loan; onBack: () => void }) {
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentResult, setPaymentResult] = useState<{ oldLoan: Loan; newLoan: Loan; paymentAmount: number; }
        | null>(null);
    const [paymentError, setPaymentError] = useState("");

    // handler for making a payment
    function handleMakePayment() {
        // values for amount to pay and minimum that can be paid
        const amount = Number(paymentAmount);


        try {
            const newLoan = processPayment(loan, amount);
            setPaymentResult({oldLoan: loan, newLoan, paymentAmount: amount });
            setPaymentError("")
        } catch(error) {
            setPaymentResult(null);
            setPaymentError(
                error instanceof Error ? error.message : "Payment Failed"
            );
        }
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

    // page before making a payment
    return (
        <main>
            <div className='page loanPage'>
                {/*Existing loan details*/}
                <LoanInfo loan = {loan} />
                <div className="customer-payment">
                    <label htmlFor="paymentAmount">Make a payment</label>
                    <div className="customer-payment-row">
                        <input
                            id="paymentAmount"
                            type="number"
                            min={calculateMinimumPayment(loan)}
                            max={loan.amountRemaining}
                            step="0.01"
                            value={paymentAmount}
                            placeholder={`Min $${calculateMinimumPayment(loan).toFixed(2)}`}
                            onChange={(event) => setPaymentAmount(event.currentTarget.value)}
                        />
                        <button
                            type="button"
                            className="customer-minimum"
                            onClick={() => setPaymentAmount(calculateMinimumPayment(loan).toFixed(2))}
                        >
                            Use minimum
                        </button>
                        <button type="button" className="payment" onClick={handleMakePayment}>
                            Submit Payment
                        </button>
                    </div>
                </div>

                {paymentError && <p role="alert" className="customer-error">{paymentError}</p>}

                <button
                    className='button back'
                    onClick={onBack}
                >Back</button>
            </div>
        </main>
    );
}

//handler for a succesful payment
function PaymentSuccess({oldLoan, newLoan, paymentAmount, onBack} :
                        { oldLoan: Loan; newLoan: Loan; paymentAmount: number; onBack: () => void; }) {
    return(
        <main>
            <h1>Payment Succesful!</h1>
            <div className="paymentSuccess">
                {/*display payment information for old and new loan*/}
                <p><span>Payment made</span><strong>${paymentAmount.toFixed(2)}</strong></p>
                <p><span>Previous balance</span><strong>${oldLoan.amountRemaining.toFixed(2)}</strong></p>
                <p><span>New balance</span><strong>${newLoan.amountRemaining.toFixed(2)}</strong></p>
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
            <h1>Outstanding Loan</h1>
            <p><span>Loan amount</span><strong>${loan.amount.toLocaleString()}</strong></p>
            <p><span>Interest rate</span><strong>{loan.interest}%</strong></p>
            <p><span>Amount remaining</span><strong>${loan.amountRemaining.toLocaleString()}</strong></p>
            <p><span>Loan duration</span><strong>{loan.loanDurationYears} years</strong></p>
            <p><span>Payment frequency</span><strong>{loan.paymentFrequency}</strong></p>
            <p><span>Opened</span><strong>{formatLoanDate(loan.dateCreated)}</strong></p>

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
