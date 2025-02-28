'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Layout from '../Layout'

export default function SearchParamsWrapper() {
  const searchParams = useSearchParams()
  
  return <Layout searchParams={searchParams.toString()} />
}

export function WrappedLayout() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  )
}