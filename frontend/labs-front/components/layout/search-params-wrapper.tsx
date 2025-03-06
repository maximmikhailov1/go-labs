'use client'

import { Suspense } from 'react'
import Layout from '../Layout'

export default function SearchParamsWrapper() {
  
  return <Layout />
}

export function WrappedLayout() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  )
}