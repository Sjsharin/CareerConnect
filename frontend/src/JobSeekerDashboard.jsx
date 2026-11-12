
import { useEffect, useState } from 'react'
import './JobSeekerDashboard.css'
import { API_BASE_URL } from './config'

const PROFILE_API =
  `${API_BASE_URL}/api/accounts/job-seeker/profile/`

function JobSeekerDashboard() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone_number: '',
    location: '',
    profile_summary: '',
    skills: '',
    education: '',
  })

  const [resume, setResume] = useState(null)
  const [existingResume, setExistingResume] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setMessage('Please log in to access your dashboard.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Unable to load your profile.')
        }

        setProfile({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          location: data.location || '',
          profile_summary: data.profile_summary || '',
          skills: data.skills || '',
          education: data.education || '',
        })

        setExistingResume(data.resume || '')
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const token = localStorage.getItem('accessToken')
    const formData = new FormData()

    Object.entries(profile).forEach(([key, value]) => {
      formData.append(key, value)
    })

    if (resume) {
      formData.append('resume', resume)
    }

    try {
      const response = await fetch(PROFILE_API, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data))
      }

      setExistingResume(data.resume || existingResume)
      setResume(null)

      setProfile({
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
        location: data.location || '',
        profile_summary: data.profile_summary || '',
        skills: data.skills || '',
        education: data.education || '',
      })

      setMessage('Your profile was updated successfully!')
    } catch (error) {
      setMessage(error.message || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const resumeUrl = existingResume
    ? existingResume.startsWith('http')
      ? existingResume
      : `${API_BASE_URL}${existingResume}`
    : ''

  const resumeName = existingResume
    ? decodeURIComponent(existingResume.split('/').pop())
    : ''

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading your dashboard...
      </div>
    )
  }

  return (
    <div className="dashboard-container">

      {/* Dashboard Header */}
      <header className="dashboard-header">

        <div>
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

          <span className="dashboard-eyebrow">
            CAREERCONNECT
          </span>

          <h1>Job Seeker Dashboard</h1>

          <p>
            Build your professional profile and showcase your skills.
          </p>
        </div>

        {/* Dashboard Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="dashboard-logout"
            onClick={() => {
              window.location.href = '/my-applications'
            }}
          >
            My Applications
          </button>

          <button
            className="dashboard-logout"
            onClick={() => {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
            }}
          >
            Log out
          </button>
        </div>

      </header>

      <div className="dashboard-content">

        {/* Edit Profile Section */}
        <section className="profile-card">
          <h2>My Profile</h2>

          <p>
            Complete your details to help employers understand you better.
          </p>

          {message && (
            <div className="dashboard-message" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="dashboard-field">
              <label>Full Name</label>
              <input
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="dashboard-field">
              <label>Phone Number</label>
              <input
                name="phone_number"
                value={profile.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="dashboard-field">
              <label>Location</label>
              <input
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>

            <div className="dashboard-field">
              <label>Profile Summary</label>
              <textarea
                name="profile_summary"
                value={profile.profile_summary}
                onChange={handleChange}
                placeholder="Write a short professional introduction"
                rows="4"
              />
            </div>

            <div className="dashboard-field">
              <label>Skills</label>
              <textarea
                name="skills"
                value={profile.skills}
                onChange={handleChange}
                placeholder="Example: Python, JavaScript, Communication"
                rows="3"
              />
            </div>

            <div className="dashboard-field">
              <label>Education</label>
              <textarea
                name="education"
                value={profile.education}
                onChange={handleChange}
                placeholder="Enter your educational qualifications"
                rows="3"
              />
            </div>

            <div className="dashboard-field">
              <label>Upload Resume</label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setResume(event.target.files[0] || null)
                }
              />

              {existingResume && (
                <a
                  className="resume-link"
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume: {resumeName}
                </a>
              )}
            </div>

            <button
              type="submit"
              className="save-profile-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save My Profile'}
            </button>

          </form>
        </section>

        {/* Profile Overview Section */}
        <section className="profile-card">
          <h2>Profile Overview</h2>

          <p>
            Here are the details saved in your profile.
          </p>

          <div className="profile-overview-details">

            <p>
              <strong>Full Name:</strong>{' '}
              {profile.full_name || 'Not added yet'}
            </p>

            <p>
              <strong>Phone Number:</strong>{' '}
              {profile.phone_number || 'Not added yet'}
            </p>

            <p>
              <strong>Location:</strong>{' '}
              {profile.location || 'Not added yet'}
            </p>

            <p>
              <strong>Profile Summary:</strong>{' '}
              {profile.profile_summary || 'Not added yet'}
            </p>

            <p>
              <strong>Skills:</strong>{' '}
              {profile.skills || 'Not added yet'}
            </p>

            <p>
              <strong>Education:</strong>{' '}
              {profile.education || 'Not added yet'}
            </p>

            <p>
              <strong>Resume:</strong>{' '}
              {existingResume ? (
                <a
                  className="resume-link"
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {resumeName}
                </a>
              ) : (
                'Not uploaded yet'
              )}
            </p>

          </div>
        </section>

      </div>
    </div>
  )
}

export default JobSeekerDashboard
