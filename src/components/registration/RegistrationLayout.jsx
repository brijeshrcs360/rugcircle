import { motion } from 'motion/react'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function RegistrationLayout({ children, currentStep, totalSteps = 5, onBack, title }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="registration-layout">
      {/* Header with back button */}
      <div className="registration-header">
        <button onClick={handleBack} className="back-btn" aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="registration-title">{title || 'Register for Workshop'}</h1>
      </div>

      {/* Progress bar */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
            }}
          />
        </div>
        <div className="progress-steps">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep

            return (
              <motion.div
                key={stepNum}
                className={`progress-step ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <span>{stepNum}</span>}
              </motion.div>
            )
          })}
        </div>
        <p className="progress-text">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Main content */}
      <motion.div
        className="registration-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      <style jsx>{`
        .registration-layout {
          min-height: 100vh;
          background: var(--color-bg);
          padding: 20px;
        }

        .registration-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: rgba(26, 22, 22, 0.05);
        }

        .registration-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .progress-section {
          max-width: 600px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .progress-bar-container {
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.4s ease;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }

        .progress-step {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
          background: var(--color-bg-alt);
          color: var(--color-text);
          border: 2px solid var(--color-border);
          transition: all 0.3s;
        }

        .progress-step.current {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(225, 128, 45, 0.15);
        }

        .progress-step.completed {
          background: var(--color-secondary);
          color: white;
          border-color: var(--color-secondary);
        }

        .progress-text {
          font-size: 12px;
          color: var(--color-text);
          opacity: 0.6;
          margin: 0;
        }

        .registration-content {
          max-width: 600px;
          margin: 0 auto;
        }

        @media (max-width: 640px) {
          .registration-layout {
            padding: 16px;
          }

          .registration-header {
            margin-bottom: 24px;
          }

          .registration-title {
            font-size: 20px;
          }

          .progress-section {
            margin-bottom: 24px;
          }

          .progress-step {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
