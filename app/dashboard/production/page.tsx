'use client'

import { useAuth } from '../../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import ProductionPipeline from '../../../components/ProductionPipeline'

export default function ProductionPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) redirect('/')
  
  return <ProductionPipeline />
}
