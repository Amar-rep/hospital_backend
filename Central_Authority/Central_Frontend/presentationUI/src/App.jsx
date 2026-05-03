import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/key/patient'

const emptyPatient = {
  name: '',
  fatherId: '',
  fatherName: '',
  address: '',
  phone: '',
  password: '',
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<PatientRegistration />} />
      <Route path="/key-recovery" element={<KeyRecovery />} />
    </Routes>
  )
}

function Shell({ children, eyebrow, title, subtitle }) {
  const location = useLocation()

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/register" aria-label="Central Authority registration">
          <span className="brand-mark">CA</span>
          <span>
            <strong>Central Authority</strong>
            <small>Patient key registry</small>
          </span>
        </Link>
        <nav className="nav-tabs" aria-label="Patient workflow">
          <Link className={location.pathname === '/register' ? 'active' : ''} to="/register">
            Register Patient
          </Link>
          <Link className={location.pathname === '/key-recovery' ? 'active' : ''} to="/key-recovery">
            Get Key Pair
          </Link>
        </nav>
      </header>

      <section className="page-heading">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </section>

      {children}
    </main>
  )
}

function PatientRegistration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyPatient)
  const [registeredPatient, setRegisteredPatient] = useState(null)
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, formData)
      const newRecord = response.data
      setFormData(emptyPatient)
      setRegisteredPatient(newRecord)
      setStatus(`Registered ${newRecord.name}. Key pair access is open until ${formatDate(newRecord.accessExpiresAt)}.`)
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to register patient. Please confirm the backend is running on port 8080.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Shell
      eyebrow="Patient registration"
      title="Create a patient record and protected key pair"
      subtitle="The generated public and private keys are stored in the backend table and can be retrieved with the password for 5 days."
    >
      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Registration Details</h2>
            <p>Enter the patient and guardian information exactly as it should appear in the registry.</p>
          </div>

          <div className="form-grid">
            <Field label="Patient Name" name="name" value={formData.name} onChange={handleChange} placeholder="Aarav Sharma" />
            <Field label="Father ID" name="fatherId" value={formData.fatherId} onChange={handleChange} placeholder="FID-10291" />
            <Field label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Rohan Sharma" />
            <Field label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            <label className="field field-wide">
              <span>Address</span>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="House, street, city, state" required />
            </label>
            <Field label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create retrieval password" />
          </div>

          <div className="actions">
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Generating Key Pair...' : 'Register Patient'}
            </button>
            <button className="secondary-btn" type="button" onClick={() => navigate('/key-recovery')}>
              Go to Key Retrieval
            </button>
          </div>
          {status && <p className="status-message">{status}</p>}
        </form>

        <RegistrationSummary record={registeredPatient} />
      </section>
    </Shell>
  )
}

function KeyRecovery() {
  const [patientId, setPatientId] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/access`, { patientId, password })
      setResult(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'No matching active record was found for that patient ID and password.')
    }
  }

  return (
    <Shell
      eyebrow="Key retrieval"
      title="Retrieve patient keys with password verification"
      subtitle="A registered patient can access the stored public and private key pair until the 5-day window closes."
    >
      <section className="recovery-layout">
        <form className="panel recovery-panel" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Verify Patient</h2>
            <p>Use the patient ID issued during registration and the password created for the record.</p>
          </div>
          <Field label="Patient ID" name="patientId" value={patientId} onChange={(event) => setPatientId(event.target.value)} placeholder="PAT-2026-ABC123" />
          <Field label="Password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
          <button className="primary-btn" type="submit">Get Key Pair</button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <KeyResult record={result} />
      </section>
    </Shell>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required />
    </label>
  )
}

function RegistrationSummary({ record }) {
  return (
    <aside className="panel table-panel">
      <div className="section-title">
        <h2>Registration Result</h2>
        <p>The backend stores the private key, public key, and password hash in the patient key table.</p>
      </div>
      <div className="summary-box">
        {record ? (
          <>
            <SummaryItem label="Patient ID" value={record.patientId} />
            <SummaryItem label="Name" value={record.name} />
            <SummaryItem label="Phone" value={record.phone} />
            <SummaryItem label="Access Until" value={formatDate(record.accessExpiresAt)} />
            <KeyBlock label="Public Key" value={record.publicKey} />
          </>
        ) : (
          <p className="empty-note">Register a patient to receive the generated patient ID and public key.</p>
        )}
      </div>
    </aside>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function KeyResult({ record }) {
  if (!record) {
    return (
      <aside className="panel result-panel blank-result">
        <span className="lock-icon">KEY</span>
        <h2>Keys remain hidden</h2>
        <p>Submit valid credentials to reveal the stored key pair for the active 5-day registration window.</p>
      </aside>
    )
  }

  return (
    <aside className="panel result-panel">
      <div className="section-title">
        <h2>{record.name}</h2>
        <p>Access expires on {formatDate(record.accessExpiresAt)}.</p>
      </div>
      <KeyBlock label="Public Key" value={record.publicKey} />
      <KeyBlock label="Private Key" value={record.privateKey} privateKey />
    </aside>
  )
}

function KeyBlock({ label, value, privateKey }) {
  return (
    <div className={privateKey ? 'key-block private' : 'key-block'}>
      <span>{label}</span>
      <code>{value}</code>
    </div>
  )
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default App
