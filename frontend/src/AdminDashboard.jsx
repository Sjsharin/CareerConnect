
import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Please log in as an administrator.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/accounts/admin/dashboard/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Unable to load dashboard.');
        }

        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Verify or revoke company verification
  const handleVerification = async (companyId, isVerified) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/accounts/admin/companies/${companyId}/verification/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_verified: isVerified,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to update verification.');
      }

      setDashboard((previous) => ({
        ...previous,
        companies: previous.companies.map((company) =>
          company.id === companyId
            ? { ...company, is_verified: isVerified }
            : company
        ),
        verified_companies:
          previous.verified_companies + (isVerified ? 1 : -1),
        pending_companies:
          previous.pending_companies + (isVerified ? -1 : 1),
      }));

      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  // Loading screen
  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        Loading admin dashboard...
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div style={{ padding: '30px' }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Dashboard screen
  return (
    <div
      style={{
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, companies and job activities.</p>
        </div>

        {/* Back to Home and Logout */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 18px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 18px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Platform Statistics */}
      <h2>Platform Overview</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          marginBottom: '35px',
        }}
      >
        {[
          ['Total Users', dashboard.total_users],
          ['Job Seekers', dashboard.total_job_seekers],
          ['Companies', dashboard.total_companies],
          ['Verified Companies', dashboard.verified_companies],
          ['Pending Companies', dashboard.pending_companies],
          ['Total Jobs', dashboard.total_jobs],
          ['Applications', dashboard.total_applications],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: '22px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              background: '#fff',
            }}
          >
            <p style={{ color: '#666', margin: 0 }}>
              {label}
            </p>
            <h2 style={{ marginBottom: 0 }}>
              {value}
            </h2>
          </div>
        ))}
      </div>

      {/* Company Management */}
      <h2>Company Management</h2>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          {/* Table Header */}
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Company
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Username
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Email
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Phone
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Verification
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {dashboard.companies.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: '15px',
                    textAlign: 'center',
                  }}
                >
                  No companies registered yet.
                </td>
              </tr>
            ) : (
              dashboard.companies.map((company) => (
                <tr key={company.id}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.company_name}
                  </td>

                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.username}
                  </td>

                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.official_email}
                  </td>

                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.phone_number}
                  </td>

                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.is_verified ? 'Verified' : 'Pending'}
                  </td>

                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {company.is_verified ? (
                      <button
                        onClick={() =>
                          handleVerification(company.id, false)
                        }
                        style={{
                          padding: '7px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Revoke Verification
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleVerification(company.id, true)
                        }
                        style={{
                          padding: '7px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Verify Company
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
