import axios from 'axios'
import React from 'react'
import { useState, ChangeEvent } from 'react'

interface Prop {
    setPicture: any
    setError: any
}

function PhotoUploader({ setPicture, setError }: Prop) {
    const [imageUpdate, setImageUpdate] = useState<string | null>(null)

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
                    `http://localhost:5001/web/users/image`,
                    formData,
                    {
                        withCredentials: true,
                    },
                )
                setPicture(response.data)
                setError('')
            } catch (error: any) {
                if (error && error.response) setError(error.response.data)
            }
        }
    }

    return (
        <>
            <input
                id="update-avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
            />
        </>
    )
}

export default PhotoUploader
