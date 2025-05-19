import { Link } from 'react-router-dom'

interface CourseCardProps {
  id: string
  code: string
  name: string
  description?: string
}

export default function CourseCard({ id, code, name, description }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${id}`}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-primary-600 mb-1">
        {code}
      </h3>
      <h4 className="text-xl font-bold text-gray-900 mb-2">
        {name}
      </h4>
      {description && (
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      )}
    </Link>
  )
} 