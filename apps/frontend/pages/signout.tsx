import { useUserContext } from '../src/context/UserContext'
import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'
import { useEffect } from 'react'

function SignOutPage() {
    const router = useRouter()
    const { logoutUser } = useUserContext()

    useEffect(() => {
        void signOutBackend()
        logoutUser()
        void router.push('/signin')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    async function signOutBackend() {
        try {
            const response = await axios.get(`http://localhost:5001/web/auth/signout/`, {
                withCredentials: true,
            })
            return response.data
        } catch (error: any) {
            logoutUser()
        }
    }
    return <></>
}

export default SignOutPage
