import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const RegisterForm = ({ onSwitch, onError }) => {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      await register(form.name, form.email, form.password)
    } catch (error) {
      onError(error.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-[13px] font-medium text-white/60">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="input-auth"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-medium text-white/60">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="input-auth"
          placeholder="name@company.com"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-medium text-white/60">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="input-auth"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-auth disabled:opacity-60"
      >
        {submitting ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-[14px] text-white/40">
        Already registered?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-[#6c63ff] hover:text-[#8b85ff] hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
