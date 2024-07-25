import React, { useEffect, useRef } from 'react'

interface Prop {
    videoID: string
}
function VideoPlayer({ videoID }: Prop) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const link = `http://localhost:5001/web/movies/view/${videoID}`

    useEffect(() => {
        if (videoRef.current) videoRef.current.src = link
    }, [videoID])

    return (
        <div className="video-wrapper">
            <video
                ref={videoRef}
                className="w-full min-[1000px]:w-[60vw] video-area"
                controls
                crossOrigin="use-credentials"
            >
                <track
                    label="English"
                    kind="subtitles"
                    srcLang="en"
                    src={`http://localhost:5001/web/movies/subtitle/${videoID}?lang=en`}
                    default
                />
                <track
                    label="Francais"
                    kind="subtitles"
                    srcLang="fr"
                    src={`http://localhost:5001/web/movies/subtitle/${videoID}?lang=fr`}
                    default
                />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}

export default VideoPlayer
