
import { useEffect, useState } from 'react';

function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applicants, setApplicants] = useState({});
  const [applicantLoading, setApplicantLoading] = useState({});
  const [applicantErrors, setApplicantErrors] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);

  const [updatingApplication, setUpdatingApplication] = useState({});
  const [statusErrors, setStatusErrors] = useState({});

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/company/jobs/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Please log in again.'
              : 'Unable to load your job postings.'
          );
        }

        const data = await response.json();
        setJobs(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, []);

  const handleViewApplicants = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }

    setExpandedJob(jobId);

    if (applicants[jobId]) {
      return;
    }

    const token = localStorage.getItem('accessToken');

    setApplicantLoading(prev => ({
      ...prev,
      [jobId]: true
    }));

    setApplicantErrors(prev => ({
      ...prev,
      [jobId]: ''
    }));

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/company/jobs/${jobId}/applicants/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Unable to load applicants.'
        );
      }

      const data = await response.json();

      setApplicants(prev => ({
        ...prev,
        [jobId]: Array.isArray(data) ? data : data.results || []
      }));

    } catch (err) {
      setApplicantErrors(prev => ({
        ...prev,
        [jobId]: err.message
      }));
    } finally {
      setApplicantLoading(prev => ({
        ...prev,
        [jobId]: false
      }));
    }
  };

  const handleUpdateStatus = async (jobId, applicationId, newStatus) => {
    const token = localStorage.getItem('accessToken');

    setUpdatingApplication(prev => ({
      ...prev,
      [applicationId]: true
    }));

    setStatusErrors(prev => ({
      ...prev,
      [applicationId]: ''
    }));

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/company/jobs/${jobId}/applicants/${applicationId}/status/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Your session has expired. Please log in again.'
            : data.detail ||
              data.status?.[0] ||
              'Unable to update application status.'
        );
      }

      setApplicants(prev => ({
        ...prev,
        [jobId]: prev[jobId].map(applicant =>
          applicant.id === applicationId
            ? { ...applicant, status: data.status }
            : applicant
        )
      }));

    } catch (err) {
      setStatusErrors(prev => ({
        ...prev,
        [applicationId]: err.message
      }));
    } finally {
      setUpdatingApplication(prev => ({
        ...prev,
        [applicationId]: false
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div style={{
      padding: '30px',
      maxWidth: '1100px',
      margin: 'auto'
    }}>

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1>Company Dashboard</h1>
          <p>Manage your job postings on CareerConnect.</p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button onClick={handleBackToHome}>
            Back to Home
          </button>

          <button onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <hr />

      <section style={{
        background: '#f3f0ff',
        padding: '25px',
        borderRadius: '10px',
        marginTop: '25px'
      }}>
        <h2>Overview</h2>
        <h1>{jobs.length}</h1>
        <p>Total Jobs Posted</p>
      </section>

      <section style={{ marginTop: '35px' }}>
        <h2>My Job Postings</h2>

        {loading && <p>Loading your job postings...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <p>You haven't posted any jobs yet.</p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>

          {jobs.map((job) => (
            <article key={job.id} style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '20px'
            }}>

              <h3>{job.title}</h3>

              <p>
                <strong>Company:</strong> {job.company_name}
              </p>

              <p>
                <strong>Location:</strong> {job.location}
              </p>

              <p>
                <strong>Job Type:</strong> {job.job_type}
              </p>

              <p>
                <strong>Salary:</strong> {job.salary || 'Not specified'}
              </p>

              <p>{job.description}</p>

              <button
                onClick={() => handleViewApplicants(job.id)}
                style={{
                  marginTop: '12px',
                  padding: '10px 16px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {expandedJob === job.id
                  ? 'Hide Applicants'
                  : 'View Applicants'}
              </button>

              {expandedJob === job.id && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '15px',
                  borderTop: '1px solid #ddd'
                }}>

                  <h3>Applicants</h3>

                  {applicantLoading[job.id] && (
                    <p>Loading applicants...</p>
                  )}

                  {applicantErrors[job.id] && (
                    <p style={{ color: 'red' }}>
                      {applicantErrors[job.id]}
                    </p>
                  )}

                  {!applicantLoading[job.id] &&
                    !applicantErrors[job.id] &&
                    applicants[job.id]?.length === 0 && (
                      <p>No applicants yet.</p>
                    )}

                  {applicants[job.id]?.map((applicant) => (
                    <div key={applicant.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      marginTop: '12px',
                      background: '#fafafa'
                    }}>

                      <h4>{applicant.applicant_name}</h4>

                      <p>
                        <strong>Username:</strong>{' '}
                        {applicant.applicant_username}
                      </p>

                      <p>
                        <strong>Email:</strong>{' '}
                        {applicant.applicant_email}
                      </p>

                      <p>
                        <strong>Applied For:</strong>{' '}
                        {applicant.job_title}
                      </p>

                      <p>
                        <strong>Application Date:</strong>{' '}
                        {new Date(applicant.applied_at).toLocaleDateString()}
                      </p>

                      <p>
                        <strong>Status:</strong>{' '}
                        {formatStatus(applicant.status)}
                      </p>

                      {applicant.status !== 'accepted' &&
                        applicant.status !== 'rejected' && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginTop: '12px'
                          }}>

                            <button
                              disabled={
                                updatingApplication[applicant.id] ||
                                applicant.status === 'shortlisted'
                              }
                              onClick={() => handleUpdateStatus(
                                job.id,
                                applicant.id,
                                'shortlisted'
                              )}
                              style={{
                                padding: '8px 12px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                opacity:
                                  updatingApplication[applicant.id] ||
                                  applicant.status === 'shortlisted'
                                    ? 0.5
                                    : 1
                              }}
                            >
                              {applicant.status === 'shortlisted'
                                ? 'Shortlisted'
                                : 'Shortlist'}
                            </button>

                            <button
                              disabled={updatingApplication[applicant.id]}
                              onClick={() => handleUpdateStatus(
                                job.id,
                                applicant.id,
                                'rejected'
                              )}
                              style={{
                                padding: '8px 12px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                opacity: updatingApplication[applicant.id]
                                  ? 0.5
                                  : 1
                              }}
                            >
                              Reject
                            </button>

                            <button
                              disabled={updatingApplication[applicant.id]}
                              onClick={() => handleUpdateStatus(
                                job.id,
                                applicant.id,
                                'accepted'
                              )}
                              style={{
                                padding: '8px 12px',
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                opacity: updatingApplication[applicant.id]
                                  ? 0.5
                                  : 1
                              }}
                            >
                              Accept
                            </button>

                          </div>
                        )}

                      {updatingApplication[applicant.id] && (
                        <p>Updating status...</p>
                      )}

                      {statusErrors[applicant.id] && (
                        <p style={{ color: 'red' }}>
                          {statusErrors[applicant.id]}
                        </p>
                      )}

                    </div>
                  ))}

                </div>
              )}

            </article>
          ))}

        </div>
      </section>
    </div>
  );
}

export default CompanyDashboard;
