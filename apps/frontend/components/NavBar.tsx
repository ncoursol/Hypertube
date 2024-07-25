import { useUserContext } from '../src/context/UserContext'
import LanguageSwitcher from './NavBar/LanguageSwitcher'
import Button from './elems/Button'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const ButtonLinkNavBar: React.FC<{
    text: string
    page: string
    currLink: string
    setCurrLink: React.Dispatch<React.SetStateAction<string>>
}> = ({ text, page, currLink, setCurrLink }) => (
    <Link href={page}>
        <p
            className={`${
                page.match(currLink)
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            aria-current="page"
            onClick={() => setCurrLink(page)}
        >
            {text}
        </p>
    </Link>
)

const LinkNavBar: React.FC<{
    currLink: string
    setCurrLink: React.Dispatch<React.SetStateAction<string>>
    profileLink: string
}> = ({ currLink, setCurrLink, profileLink }) => {
    const { t } = useTranslation('common')
    const { user } = useUserContext()

    return (
        <div className="items-center pt-2 ml-6 hidden min-[770px]:block">
            <div className="flex space-x-4">
                {user && (
                    <>
                        <ButtonLinkNavBar
                            text={t('navBar.profile')}
                            page={profileLink}
                            currLink={currLink}
                            setCurrLink={setCurrLink}
                        />
                        <ButtonLinkNavBar
                            text={t('settingsMsg')}
                            page="/settings"
                            currLink={currLink}
                            setCurrLink={setCurrLink}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

const LogoNavBar = () => {
    const { user } = useUserContext()
    const [redir, setRedir] = useState<string>('/signin')

    useEffect(() => {
        setRedir(user ? '/' : '/signin')
    }, [user])

    return (
        <Link href={redir}>
            <div className="flex flex-row">
                <div className="flex flex-shrink-0 items-center sm:pl-5">
                    <img className="h-8 w-auto sm:h-12" src="/navbar_logo.png" alt="Matcha" />
                </div>
                <div className="text-2xl font-extrabold ... pt-1 pl-1 sm:text-4xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-50 via-white to-blue-50">
                        NaanTube
                    </span>
                </div>
            </div>
        </Link>
    )
}

const DropdownMenu = () => {
    const { user } = useUserContext()
    const router = useRouter()
    const { t } = useTranslation('common')

    return user ? (
        <Button
            text={t('navBar.signOut')}
            onClick={() => {
                void router.push('/signout')
            }}
        />
    ) : (
        <Button
            text={t('signIn')}
            onClick={() => {
                void router.push('/signin')
            }}
        />
    )
}

function MobileMenuBoutton({ showMenu, setShowMenu }: { showMenu: boolean; setShowMenu: any }) {
    return (
        <div className="inset-y-0 left-0 flex items-center min-[770px]:hidden">
            {/* <!-- Mobile menu button--> */}
            <button
                type="button"
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => {
                    setShowMenu(!showMenu)
                }}
            >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>

                <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                </svg>
            </button>
        </div>
    )
}

interface PropMobileMenuNavBar {
    showMenu: boolean
    currLink: string
    setCurrLink: any
    profileLink: string
}

function MobileMenu({ showMenu, currLink, setCurrLink, profileLink }: PropMobileMenuNavBar) {
    const { t } = useTranslation('common')
    return showMenu ? (
        <>
            {/* <!-- Mobile menu, show/hide based on menu state. --> */}
            <div className="min-[770px]:hidden" id="mobile-menu">
                <div className="space-y-1 px-2 pb-3 pt-2">
                    {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
                    <ButtonLinkNavBar
                        text={t('navBar.profile')}
                        page={profileLink}
                        currLink={currLink}
                        setCurrLink={setCurrLink}
                    />
                    <ButtonLinkNavBar
                        text={t('settingsMsg')}
                        page="/settings"
                        currLink={currLink}
                        setCurrLink={setCurrLink}
                    />
                </div>
            </div>
        </>
    ) : null
}

function NavBar() {
    const [showMenu, setShowMenu] = useState<boolean>(false)
    const [currLink, setCurrLink] = useState<string>('no')
    const [profileLink, setProfileLink] = useState<string>('/profile')
    const router = useRouter()
    const { user } = useUserContext()

    useEffect(() => {
        if (user) setProfileLink(`/profile/${user.id}`)
    }, [user])

    useEffect(() => {
        if (router.pathname.match('/profile')) setCurrLink('/profile')
        else if (router.pathname.match('/settings')) setCurrLink('/settings')
        else if (router.pathname.match('/find')) setCurrLink('/find')
        else if (router.pathname.match('/movies')) setCurrLink('/movies')
        else setCurrLink('no')
    }, [currLink])

    return (
        <header>
            <nav className="fixed w-full bg-zinc-800 z-20">
                <div className="mx-auto max-w-7xl px-2 sm:pl-6 lg:pl-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="flex flex-1 sm:items-stretch sm:justify-start">
                            <MobileMenuBoutton showMenu={showMenu} setShowMenu={setShowMenu} />
                            <LogoNavBar />
                            <LinkNavBar
                                currLink={currLink}
                                setCurrLink={setCurrLink}
                                profileLink={profileLink}
                            />
                        </div>
                        <div className="inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6">
                            <DropdownMenu />
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
                <MobileMenu
                    showMenu={showMenu}
                    currLink={currLink}
                    setCurrLink={setCurrLink}
                    profileLink={profileLink}
                />
            </nav>
            <div className="h-16" />
        </header>
    )
}

export default NavBar
