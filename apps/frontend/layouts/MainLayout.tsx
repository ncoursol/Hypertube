import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import Head from 'next/head'
import React, { ReactNode } from 'react'

const MainLayout: React.FC<{ children?: ReactNode; className?: string; className2?: string }> = ({
    children,
    className,
    className2,
}) => (
    <>
        <Head>
            <title>NaanTube</title>
        </Head>
        <main className={className}>
            <NavBar />
            <div
                className={
                    className2 ||
                    'flex flex-grow overflow-auto min-h-full flex-col justify-center py-12'
                }
            >
                {children}
            </div>
            <Footer />
        </main>
    </>
)

export default MainLayout
