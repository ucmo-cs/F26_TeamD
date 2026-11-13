import './CustomerPortal.css'
import {useState, type FormEvent} from 'react'

function ChangeCustomerInfoPortal({ onBack }: { onBack: () => void}) {
    const[status, setStatus] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault()
        setStatus('Update submitted.')
    }

    return(
        <main className ="page customer-info-page">
            <section className="customer-info-card" aria-labelledby="profile-title">
                <h1 id="profile-title">Update Profile</h1>
                <p className="customer-info-intro">
                    Keep your contact information current.
                </p>

                <form className="customer-info-form" onSubmit={handleSubmit}>
                    <label htmlFor="customer-name">Customer Name</label>
                    <input
                        id="customer-name"
                        name="customerName"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        required
                    />

                    <label htmlFor="customer-email">Email Address</label>
                    <input
                        id="customer-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                    />

                    <label htmlFor="customer-phone">Phone Number</label>
                    <input
                        id="customer-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(123)-456-7890"
                        required
                    />

                    <div className="customer-info-actions">
                        <button className="customer-info-submit" type="submit">
                            Update Profile
                        </button>
                        <button
                            className="customer-info-cancel"
                            type="button"
                            onClick={onBack}
                        >
                            Cancel
                        </button>
                    </div>

                    <p className="customer-info-status" role="status" aria-live="polite">
                        {status}
                    </p>
                </form>
            </section>
        </main>
    )
    
}

export default ChangeCustomerInfoPortal