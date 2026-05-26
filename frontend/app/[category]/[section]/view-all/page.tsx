import CategoryViewAllClient from '@/components/templates/CategoryViewAllClient'

interface PageProps {
  params: {
    category: string
    section: string
  }
}

export default function CategoryViewAllPage({ params }: PageProps) {
  return <CategoryViewAllClient category={params.category} section={params.section} />
}
