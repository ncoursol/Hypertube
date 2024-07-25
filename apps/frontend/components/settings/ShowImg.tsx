import PhotoUploader from './PhotoUpload'
import axios from 'axios'
import React, { useState, ChangeEvent } from 'react'

interface Prop {
    picture: string //picture to show
    setPicture: any
    setError: any
}

function ShowImg({ picture, setPicture, setError }: Prop) {
    const [imageUpdate, setImageUpdate] = useState<string | null>(null)

    let link = './norminet.jpeg'
    if (picture) link = `http://localhost:5001/web/users/image/${picture}`
    const altImage = `image description ${picture}`
    async function deletePictureBackend() {
        try {
            const response = await axios.delete(
                `http://localhost:5001/web/users/image/${picture}`,
                {
                    withCredentials: true,
                },
            )
            // console.log(response.data);
            setPicture(null)
            setError('')
            return response.data
        } catch (error: any) {
            setError(error.response.data)
            //to handle ?
        }
    }

    async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const selectedImage = e.target.files?.[0]
        if (selectedImage) {
            const reader = new FileReader()
            reader.onload = () => {
                setImageUpdate(reader.result as string)
            }
            reader.readAsDataURL(selectedImage)
        }
        if (imageUpdate) {
            // console.log()
        } //useless but for error management purpose

        if (selectedImage) {
            let formData = new FormData()

            formData.append('image', selectedImage)

            try {
                const response = await axios.post(
                    'http://localhost:5001/web/users/image',
                    formData,
                    { withCredentials: true },
                )
                setPicture(response.data)
                setError('')
            } catch (error: any) {
                if (error && error.response) setError(error.response.data)
            }
        }
    }

    function handleOnDeleteImg(event: any) {
        event.preventDefault()
        void deletePictureBackend()
    }

    return (
        <div className="relative w-40 flex items-center justify-center">
            <img
                className="w-40 h-40 object-cover"
                src={link}
                alt={altImage}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/norminet.jpeg'
                }}
            />
            <div className="group absolute top-0 left-0 w-full h-full opacity-0 transition-opacity hover:opacity-100">
                <label className="block text-sm font-semibold py-1 text-gray-900 dark:text-gray w-full text-center bg-white bg-opacity-60 cursor-pointer">
                    Update photo
                    <input
                        id="update-avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </label>

                <PhotoUploader setPicture={setPicture} setError={setError} />
                {picture && (
                    <label className="block text-sm font-semibold py-1 text-gray-900 dark:text-gray absolute bottom-0 left-0 w-full text-center bg-white bg-opacity-60 cursor-pointer">
                        Delete
                        <button className="hidden" onClick={handleOnDeleteImg}></button>
                    </label>
                )}
            </div>
        </div>
    )
}

export default ShowImg
