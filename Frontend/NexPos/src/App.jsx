import { useMemo, useState } from 'react'
import Dashboard from './Dashboard.jsx'
import Login from './Login.jsx'

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      const employeeText = localStorage.getItem('auth_employee')
      const employee = employeeText ? JSON.parse(employeeText) : null
      if (!token || !employee) return null
      return { token, employee }
    } catch {
      return null
    }
  })

  const user = useMemo(() => session?.employee || null, [session])

  function handleLogin(res) {
    const token = res.token
    const employee = res.employee
    localStorage.setItem('token', token)
    localStorage.setItem('auth_employee', JSON.stringify(employee))
    setSession({ token, employee })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('auth_employee')
    setSession(null)
  }

  if (!session) return <Login onLogin={handleLogin} />

  return <Dashboard user={user} onLogout={handleLogout} />
}
