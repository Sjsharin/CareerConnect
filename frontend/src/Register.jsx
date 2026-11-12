import { useState } from 'react'
import './Register.css'

function Register() {
  const [role, setRole] = useState('job_seeker')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    company_name: '',
    official_email: '',
    phone_number: '',
  })

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/accounts/register/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...form, role }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const details = Object.entries(data)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(', ')
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)

            return `${field}: ${text}`
          })
          .join(' ')

        throw new Error(details || 'Registration failed.')
      }

      setMessage(
        role === 'company'
          ? 'Registration successful! Your company must be verified before posting jobs.'
          : 'Registration successful! You can now log in when login is available.'
      )

      setForm({
        username: '',
        email: '',
        password: '',
        company_name: '',
        official_email: '',
        phone_number: '',
      })
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Create Your Account</h1>
        <p className="register-subtitle">
          Join CareerConnect and take the next step in your career.
        </p>

        <label htmlFor="role">Register as</label>
        <select
          id="role"
          value={role}
          onChange={(event) => {
            setRole(event.target.value)
            setMessage('')
            setError('')
          }}
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="company">Company</option>
        </select>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <label htmlFor="email">Account Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={8}
          required
        />

        {role === 'company' && (
          <>
            <label htmlFor="company_name">Company Name</label>
            <input
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
            />

            <label htmlFor="official_email">Official Company Email</label>
            <input
              id="official_email"
              name="official_email"
              type="email"
              value={form.official_email}
              onChange={handleChange}
              required
            />

            <label htmlFor="phone_number">Company Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {message && <p className="register-success" role="status">{message}</p>}
        {error && <p className="register-error" role="alert">{error}</p>}
      </form>
    </main>
  )
}

export default Register