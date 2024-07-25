import Link from 'next/link'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

function Footer() {
    return (
        <footer className="fixed bottom-0 w-full bg-zinc-800 z-20 h-14">
            <div className="mx-auto max-w-7xl px-2 sm:pl-6 lg:pl-8">
                <div className="relative flex h-14 items-center justify-between text-zinc-300">
                    <div className="flex flex-1 sm:items-stretch sm:justify-start">
                        <span>© 2023 NaanTube™. All Rights Reserved.</span>
                    </div>
                    <Link target="_blank" href="https://github.com/Haksell/hypertube">
                        <FaGithub size={24} />
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
