import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LoginForm = ({ onSwitch, onError }) => {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      await login(form.email, form.password)
    } catch (error) {
      onError(error.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="input-auth pr-12"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            onMouseDown={(event) => event.preventDefault()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-auth disabled:opacity-60"
      >
        {submitting ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-[14px] text-white/40">
        No account yet?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-[#6c63ff] hover:text-[#8b85ff] hover:underline">
          Create one
        </button>
      </p>
    </form>
  )
}

export default LoginForm
