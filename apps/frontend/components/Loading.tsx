import MainLayout from '../layouts/MainLayout'
import React from 'react'

export const LoadingNoLayout = () => (
    <div className="w-full flex items-center justify-center">
        <img
            src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/725eef121244331.60c1c7928b5dd.gif"
            alt="loading"
        />
    </div>
)
const Loading = () => (
    <MainLayout>
        <LoadingNoLayout />
    </MainLayout>
)

export default Loading
