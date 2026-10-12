import {useState} from "react"
import "./AdminPortal.css"
import App from "./App"

function AdminLanding() {
    const [showHomePage, setShowHomePage] = useState(false)

    if (showHomePage){
        return <App />
    }

    return (
        <main>
            {/*place to put the admins name (x)*/}
            <h1>Hello Admin (x)</h1>
            <button type="button"
                    onClick={() => setShowHomePage(true)}
            >
            Return to main page</button>
        </main>
    )
}
export default AdminLanding