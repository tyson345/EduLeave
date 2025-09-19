interface ErrorMessageProps {
  title?: string
  message: string
  details?: string[]
  className?: string
}

export function ErrorMessage({ title = 'Error', message, details, className = '' }: ErrorMessageProps) {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">{title}</h2>
        <p className="text-red-600">{message}</p>
        {details && details.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-700">
              Please make sure:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-700">
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
