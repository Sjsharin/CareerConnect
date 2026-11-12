import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Register from './Register'
import Login from './Login'
import JobSeekerDashboard from './JobSeekerDashboard'
import MyApplications from './MyApplications'
import CompanyDashboard from './CompanyDashboard'
import AdminDashboard from './AdminDashboard'
import { API_BASE_URL } from './config'

const API_URL = `${API_BASE_URL}/api/jobs/`

const emptyJobForm = {
  title: '',
  company_name: '',
  location: '',
  description: '',
  salary: '',
  required_skills: '',
  job_type: 'Full-time',
}

const locations = [
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Delhi',
  'Coimbatore',
  'Madurai',
  'Remote',
]

function App() {
  // Page navigation
  const [currentPage, setCurrentPage] = useState(
    window.location.pathname
  )

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPage(window.location.pathname)
      window.scrollTo(0, 0)
    }

    window.addEventListener('popstate', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [])

  const navigateTo = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPage(path)
    window.scrollTo(0, 0)
  }

 const openRegister = () => navigateTo('/register')
const openLogin = () => navigateTo('/login')
const openHome = () => navigateTo('/')

const openDashboard = () => {
  const role = localStorage.getItem('userRole')

  if (role === 'admin') {
    navigateTo('/admin-dashboard')
  } else if (role === 'company') {
    navigateTo('/company-dashboard')
  } else {
    navigateTo('/dashboard')
  }
}
  // Job data
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const [showJobForm, setShowJobForm] = useState(false)
  const [jobMessage, setJobMessage] = useState('')
  const [jobForm, setJobForm] = useState({ ...emptyJobForm })
  const [postingJob, setPostingJob] = useState(false)
  const [applyingJobId, setApplyingJobId] = useState(null)
  const [applicationMessage, setApplicationMessage] = useState('')

  // Load jobs from Django
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load jobs')
        }
        return response.json()
      })
      .then((data) => {
        setJobs(Array.isArray(data) ? data : data.results || [])
      })
      .catch(() => {
        setError('Unable to load jobs. Please try again later.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Search and location filters
  const filteredJobs = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    const location = searchLocation.trim().toLowerCase()

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company_name,
        job.description,
        job.required_skills,
        job.job_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesKeyword =
        !keyword || searchableText.includes(keyword)

      const matchesLocation =
        !location ||
        (job.location || '').trim().toLowerCase() === location

      return matchesKeyword && matchesLocation
    })
  }, [jobs, searchKeyword, searchLocation])

  // Job form input
  const handleJobInput = (event) => {
    const { name, value } = event.target

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Open job form only after login
  const handlePostJobClick = () => {
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      setJobMessage('Please log in before trying to post a job.')
      setShowJobForm(false)
      return
    }

    setJobMessage('')
    setShowJobForm((previous) => !previous)
  }

  // Submit a new job using JWT authentication
  const handleJobSubmit = async (event) => {
    event.preventDefault()
    setJobMessage('')

    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      setJobMessage('Your login session was not found. Please log in.')
      setShowJobForm(false)
      return
    }

    setPostingJob(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobForm),
      })

      const responseText = await response.text()

let data = {}

try {
  data = JSON.parse(responseText)
} catch {
  throw new Error(
    `Server returned an unexpected response. Status: ${response.status}. Check the Django backend and API URL.`
  )
}

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Your login session has expired. Please log in again.'
          )
        }

        if (response.status === 403) {
          throw new Error(
            'Only admin-verified company accounts can post jobs. Your account may be awaiting verification.'
          )
        }

        const details = Object.entries(data)
          .map(([field, messages]) => {
            const message = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            return `${field}: ${message}`
          })
          .join('\n')

        throw new Error(details || 'Unable to post job.')
      }

      setJobs((previous) => [data, ...previous])
      setJobForm({ ...emptyJobForm })
      setJobMessage('Job posted successfully!')
      setShowJobForm(false)

    } catch (err) {
      setJobMessage(
        err.message || 'Unable to connect to the server.'
      )
    } finally {
      setPostingJob(false)
    }
  }
  const handleApplyNow = async (jobId) => {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    alert('Please log in as a Job Seeker before applying.')
    navigateTo('/login')
    return
  }

  setApplyingJobId(jobId)
  setApplicationMessage('')

  try {
    const response = await fetch(
     `${API_BASE_URL}/api/jobs/${jobId}/apply/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    )
const responseText = await response.text()
let data = {}

try {
  data = JSON.parse(responseText)
} catch {
  console.log('Server response:', responseText)
  throw new Error(`Unexpected server response. HTTP status: ${response.status}`)
}

    if (!response.ok) {
      throw new Error(
        data.detail || 'Unable to submit your application.'
      )
    }

    setApplicationMessage(
      `Successfully applied for ${data.job_title}!`
    )
  } catch (error) {
    setApplicationMessage(error.message)
  } finally {
    setApplyingJobId(null)
  }
}
// All hooks are above conditional returns

if (currentPage === '/dashboard') {
  return <JobSeekerDashboard />
}
if (currentPage === '/company-dashboard') {
  return <CompanyDashboard />
}
if (currentPage === '/admin-dashboard') {
  return <AdminDashboard />
}
if (currentPage === '/my-applications') {
  return <MyApplications />
}
if (currentPage === '/register') {
  return (
    <>
      <button type="button" onClick={openHome}>
        ← Back to Home
      </button>
      <Register />
    </>
  )
}

if (currentPage === '/login') {
  return (
    <>
      <button type="button" onClick={openHome}>
        ← Back to Home
      </button>
 <Login
  onLoginSuccess={(role) => {
  localStorage.setItem('userRole', role);

  if (role === 'admin') {
    navigateTo('/admin-dashboard');
  } else if (role === 'company') {
    navigateTo('/company-dashboard');
  } else {
    navigateTo('/dashboard');
  }
}}
/>
    </>
  )
}
  // Homepage
  return (
    <div className="app">
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            openHome()
          }}
        >
          Career<span>Connect</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#categories">Categories</a>
          <a href="#recruiters">For Recruiters</a>
        </nav>

        <div className="nav-actions">
  {localStorage.getItem('accessToken') && (
    <button
      className="login-btn"
      onClick={openDashboard}
    >
      Dashboard
    </button>
  )}

  <button
    className="login-btn"
    onClick={openLogin}
  >
    Log in
  </button>

  <button
    className="signup-btn"
    onClick={openRegister}
  >
    Get Started
  </button>
</div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR NEXT OPPORTUNITY STARTS HERE
            </span>

            <h1>
              Find work that
              <br />
              <span>moves you forward.</span>
            </h1>

            <p>
              Discover opportunities, build your professional resume,
              and take the next step in your career.
            </p>

            <form
              className="search-bar"
              onSubmit={(event) => {
                event.preventDefault()
                document.getElementById('jobs')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
            >
              <input
                aria-label="Job title or keyword"
                placeholder="Job title or keyword"
                value={searchKeyword}
                onChange={(event) =>
                  setSearchKeyword(event.target.value)
                }
              />

              <select
                aria-label="Location"
                value={searchLocation}
                onChange={(event) =>
                  setSearchLocation(event.target.value)
                }
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <button type="submit">Search Jobs →</button>
            </form>

            <p className="popular">
              Popular: Python Developer · Web Developer · Internships
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle">
              <div className="art-card card-one">
                <span className="art-icon purple">↗</span>
                <div>
                  <strong>Career growth</strong>
                  <small>Build your future</small>
                </div>
              </div>

              <div className="art-card card-two">
                <span className="art-icon green">✓</span>
                <div>
                  <strong>New opportunities</strong>
                  <small>Your next chapter</small>
                </div>
              </div>

              <div className="art-center">
                <span>✦</span>
                <strong>Your future</strong>
                <small>Starts with one step.</small>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>Find</strong>
            <span>Relevant opportunities</span>
          </div>
          <div>
            <strong>Build</strong>
            <span>A professional resume</span>
          </div>
          <div>
            <strong>Connect</strong>
            <span>With recruiters</span>
          </div>
          <div>
            <strong>Grow</strong>
            <span>In your career</span>
          </div>
        </section>

        <section className="categories" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE OPPORTUNITIES</span>
              <h2>Jobs for every ambition</h2>
            </div>
            <span className="muted">
              Explore popular career paths
            </span>
          </div>

          <div className="category-grid">
            {[
              ['⌘', 'Technology', 'Software & IT'],
              ['✎', 'Design', 'Creative careers'],
              ['▤', 'Marketing', 'Growth & content'],
              ['◈', 'Business', 'Operations & sales'],
            ].map(([icon, title, description]) => (
              <article className="category-card" key={title}>
                <span className="category-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="category-arrow">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Featured opportunities</h2>
              <span className="muted">
                {filteredJobs.length} job
                {filteredJobs.length === 1 ? '' : 's'} found
              </span>
            </div>

            <button
              className="signup-btn"
              onClick={handlePostJobClick}
            >
              {showJobForm ? 'Cancel' : '+ Post a Job'}
            </button>
          </div>

          {showJobForm && (
            <form className="job-form" onSubmit={handleJobSubmit}>
              <h3>Post a New Job</h3>

              <input
                name="title"
                placeholder="Job title"
                value={jobForm.title}
                onChange={handleJobInput}
                required
              />

              <input
                name="company_name"
                placeholder="Company name"
                value={jobForm.company_name}
                onChange={handleJobInput}
                required
              />

              <select
                name="location"
                value={jobForm.location}
                onChange={handleJobInput}
                required
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <input
                name="salary"
                placeholder="Salary (optional)"
                value={jobForm.salary}
                onChange={handleJobInput}
              />

              <select
                name="job_type"
                value={jobForm.job_type}
                onChange={handleJobInput}
                required
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>

              <textarea
                name="description"
                placeholder="Job description"
                value={jobForm.description}
                onChange={handleJobInput}
                required
              />

              <textarea
                name="required_skills"
                placeholder="Required skills (e.g. Python, Django, MySQL)"
                value={jobForm.required_skills}
                onChange={handleJobInput}
                required
              />

              <button
                className="signup-btn"
                type="submit"
                disabled={postingJob}
              >
                {postingJob ? 'Posting...' : 'Submit Job'}
              </button>

              {jobMessage && (
                <p role="status" aria-live="polite">
                  {jobMessage}
                </p>
              )}
            </form>
          )}

          {!showJobForm && jobMessage && (
            <p role="status" aria-live="polite">
              {jobMessage}
            </p>
          )}

          <div className="jobs-grid">
            {loading && <p>Loading jobs...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && filteredJobs.length === 0 && (
              <p>
                No matching jobs found. Try another keyword or location.
              </p>
            )}

            {!loading &&
              !error &&
              filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-top">
                    <span className="company-logo">
                      {job.company_name?.charAt(0) || 'C'}
                    </span>
                    <span className="job-type">{job.job_type}</span>
                  </div>

                  <p className="job-category">Job Opportunity</p>
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company_name}</p>

                  <div className="job-meta">
                    <span>⌖ {job.location}</span>
                    <strong>
                      {job.salary || 'Salary not specified'}
                    </strong>
                  </div>

                  <button
  className="apply-btn"
  onClick={() => alert(job.description)}
>
  View opportunity →
</button>

<button
  className="apply-btn"
  onClick={() => handleApplyNow(job.id)}
  disabled={applyingJobId === job.id}
>
  {applyingJobId === job.id ? 'Applying...' : 'Apply Now'}
</button>

{applicationMessage && (
  <p role="status">{applicationMessage}</p>
)}
                </article>
              ))}
          </div>
        </section>

        <section className="recruiter-banner" id="recruiters">
          <div>
            <span className="eyebrow">FOR EMPLOYERS</span>
            <h2>Meet your next great hire.</h2>
            <p>
              Connect with talent and manage your job openings in one place.
            </p>
          </div>

          <button onClick={openRegister}>
            I'm hiring →
          </button>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home">
          Career<span>Connect</span>
        </a>
        <p>Connecting people with opportunities.</p>
        <span>© 2026 CareerConnect · Student Project</span>
      </footer>
    </div>
  )
}

export default App