import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useState, useEffect, DependencyList } from 'react'

import ory from './sdk'

// Returns a function which will log the user out
export function createLogoutHandler(deps?: DependencyList) {
  const [logoutToken, setLogoutToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    ory
      .createSelfServiceLogoutFlowUrlForBrowsers()
      .then(({ data }) => {
        // This is a workaround until https://github.com/ory/kratos/pull/1758 lands.
        const lo = new URL(String(data.logout_url))
        setLogoutToken(String(lo.searchParams.get('token')))
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 401:
            // do nothing, the user is not logged in
            return
        }

        // Something else happened!
        return Promise.reject(err)
      })
  }, deps)

  return () => {
    if (logoutToken) {
      ory
        .submitSelfServiceLogoutFlow(logoutToken)
        .then(() => router.push('/login'))
        .then(() => router.reload())
    }
  }
}
