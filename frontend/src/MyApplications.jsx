
import { useEffect, useState } from 'react'
import './MyApplications.css'

const APPLICATIONS_API =
  'http://127.0.0.1:8000/api/my-applications/'

function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setMessage('Please log in to view your applications.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(APPLICATIONS_API, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (response.status === 401) {
          throw new Error(
            'Your session has expired. Please log in again.'
          )
        }

        if (!response.ok) {
          throw new Error(
            data.detail || 'Unable to load applications.'
          )
        }

        setApplications(Array.isArray(data) ? data : [])
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const formatStatus = (status) => {
    if (!status) return 'Pending'

    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="applications-container">
        <p>Loading your applications...</p>
      </div>
    )
  }

  return (
    <div className="applications-container">

      <header className="applications-header">

        <button
          onClick={() => {
            window.location.href = '/'
          }}
          style={{
            padding: '10px 18px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '8px',
            background: '#252942',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>

        <h1>My Applications</h1>

        <p>
          Track the status of the jobs you have applied for.
        </p>

      </header>

      {message && (
        <div className="applications-message">
          {message}
        </div>
      )}

      {!message && applications.length === 0 && (
        <div className="empty-applications">
          <h2>No Applications Yet</h2>

          <p>
            You haven't applied for any jobs yet.
            Start exploring jobs and apply for suitable opportunities.
          </p>
        </div>
      )}

      {!message && applications.length > 0 && (
        <div className="applications-list">

          {applications.map((application) => (
            <div
              className="application-card"
              key={application.id}
            >

              <h2>
                {application.job_title}
              </h2>

              <p>
                <strong>Company:</strong>{' '}
                {application.company_name}
              </p>

              <p>
                <strong>Application Date:</strong>{' '}
                {formatDate(application.applied_at)}
              </p>

              <p>
                <strong>Status:</strong>{' '}

                <span
                  className={`application-status ${application.status}`}
                >
                  {formatStatus(application.status)}
                </span>
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default MyApplications
