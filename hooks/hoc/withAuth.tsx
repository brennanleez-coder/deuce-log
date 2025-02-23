import React, { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/FullScreenLoader'

export default function withAuth<T extends JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<T>) {
  const AuthenticatedComponent: React.FC<T> = (props) => {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
      if (status === 'unauthenticated') {
        // Optionally pass a callbackUrl to redirect back after sign-in
        signIn(undefined, { callbackUrl: "/" })
      }
    }, [status, router])

    // While checking authentication, display a loading indicator (or skeleton, etc.)
    if (status === 'loading') {
      return <Loader fullScreen/>
    }

    // If authenticated, render the wrapped component
    if (session) {
      return <WrappedComponent {...props} />
    }

    // If not authenticated, render nothing or a fallback
    return null
  }

  return AuthenticatedComponent
}
