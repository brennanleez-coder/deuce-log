import React, { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/FullScreenLoader';

export default function withAuth<T extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<T>
) {
  const AuthenticatedComponent: React.FC<T> = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        signIn(undefined, { callbackUrl: '/auth/login' });
      }
    }, [status]);

    useEffect(() => {
      if (status === 'authenticated' && session?.user) {
        localStorage.setItem('userLoggedIn', 'true');
      } else if (status === 'unauthenticated') {
        localStorage.removeItem('userLoggedIn');
      }
    }, [status, session]);

    if (status === 'loading') {
      return <Loader fullScreen />;
    }

    if (session) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  return AuthenticatedComponent;
}
