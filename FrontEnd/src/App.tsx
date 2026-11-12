import { useState, type FormEvent } from 'react'
import CustomerLanding from './CustomerPortal'
import './App.css'
import AdminLanding from "./AdminPortal.tsx";
// import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'


function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [session, setSession] = useState<{role: "customer" | "admin"; id: number; displayName: string} | null>(null)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError("")
    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) throw new Error("Login failed. Check your username/email and password.")
      setSession(await response.json())
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not connect to the server")
    }
  }

  if (session?.role === "customer") return <CustomerLanding customerId={session.id} />
  if (session?.role === "admin") return <AdminLanding adminName={session.displayName} />

  return (
    <div className="page">
      <form className="login-form" onSubmit={handleLogin}>
          <h1>Welcome back!</h1>
          <p className="login-subtitle">Sign in to your account</p>
        <div className="field">
          <label htmlFor="username">Customer email or admin username:</label>
          <input id="username" type="text" value={username} onChange={(event) => setUsername(event.currentTarget.value)} required />
        </div>

        <div className="field">
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} required />
        </div>

        {loginError && <p role="alert">{loginError}</p>}
        <button type="submit" className="login-button">LOG IN</button>
      </form>
    </div>
  );
    // <>
    //   <section id="center">
    //     <div className="hero">
    //       <img src={heroImg} className="base" width="170" height="179" alt="" />
    //       <img src={reactLogo} className="framework" alt="React logo" />
    //       <img src={viteLogo} className="vite" alt="Vite logo" />
    //     </div>
    //     <div>
    //       <h1>Get started</h1>
    //       <p>
    //         Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
    //       </p>
    //     </div>
    //     <button
    //       type="button"
    //       className="counter"
    //       onClick={() => setCount((count) => count + 1)}
    //     >
    //       Count is {count}
    //     </button>
    //   </section>

    //   <div className="ticks"></div>

    //   <section id="next-steps">
    //     <div id="docs">
    //       <svg className="icon" role="presentation" aria-hidden="true">
    //         <use href="/icons.svg#documentation-icon"></use>
    //       </svg>
    //       <h2>Documentation</h2>
    //       <p>Your questions, answered</p>
    //       <ul>
    //         <li>
    //           <a href="https://vite.dev/" target="_blank">
    //             <img className="logo" src={viteLogo} alt="" />
    //             Explore Vite
    //           </a>
    //         </li>
    //         <li>
    //           <a href="https://react.dev/" target="_blank">
    //             <img className="button-icon" src={reactLogo} alt="" />
    //             Learn more
    //           </a>
    //         </li>
    //       </ul>
    //     </div>
    //     <div id="social">
    //       <svg className="icon" role="presentation" aria-hidden="true">
    //         <use href="/icons.svg#social-icon"></use>
    //       </svg>
    //       <h2>Connect with us</h2>
    //       <p>Join the Vite community</p>
    //       <ul>
    //         <li>
    //           <a href="https://github.com/vitejs/vite" target="_blank">
    //             <svg
    //               className="button-icon"
    //               role="presentation"
    //               aria-hidden="true"
    //             >
    //               <use href="/icons.svg#github-icon"></use>
    //             </svg>
    //             GitHub
    //           </a>
    //         </li>
    //         <li>
    //           <a href="https://chat.vite.dev/" target="_blank">
    //             <svg
    //               className="button-icon"
    //               role="presentation"
    //               aria-hidden="true"
    //             >
    //               <use href="/icons.svg#discord-icon"></use>
    //             </svg>
    //             Discord
    //           </a>
    //         </li>
    //         <li>
    //           <a href="https://x.com/vite_js" target="_blank">
    //             <svg
    //               className="button-icon"
    //               role="presentation"
    //               aria-hidden="true"
    //             >
    //               <use href="/icons.svg#x-icon"></use>
    //             </svg>
    //             X.com
    //           </a>
    //         </li>
    //         <li>
    //           <a href="https://bsky.app/profile/vite.dev" target="_blank">
    //             <svg
    //               className="button-icon"
    //               role="presentation"
    //               aria-hidden="true"
    //             >
    //               <use href="/icons.svg#bluesky-icon"></use>
    //             </svg>
    //             Bluesky
    //           </a>
    //         </li>
    //       </ul>
    //     </div>
    //   </section>

    //   <div className="ticks"></div>
    //   <section id="spacer"></section>
    // </>
  
}

export default App
