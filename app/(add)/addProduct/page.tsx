"use client"

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./action";
import { MB } from "@/lib/constants";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { useFormState } from "react-dom";

export default function AddProduct() {
    const [preview, setPreview] = useState<string>("")
    const [uploadURL, setUploadURL] = useState<string>("")
    const [photoId, setPhotoId] = useState("")
    //handle when file uploaded is greater than 10MB 
    const isOversizeImage = (file: File): boolean => {
        if (file.size > 10 * MB) {
            alert("Please upload images less than 10MB")
            return true
        }
        return false
    }
    //handle when file is uploaded
    const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { files } } = event
        if (!files) {
            return
        }
        const file = files[0]
        if (isOversizeImage(file)) {
            return
        }
        const url = URL.createObjectURL(file)
        setPreview(url)
        const { success, result } = await getUploadUrl()
        if (success) {
            const { id, uploadURL } = result
            setUploadURL(uploadURL)
            setPhotoId(id)
        }
    }
    const interceptAction = async (_: any, formData: FormData) => {
        const file = formData.get("photo");
        if (!file) {
            return;
        }
        const cloudflareForm = new FormData();
        cloudflareForm.append("file", file);
        const response = await fetch(uploadURL, {
            method: "post",
            body: cloudflareForm,
        });
        console.log(await response.text());
        if (response.status !== 200) {
            return;
        }
        const photoUrl = `https://imagedelivery.net/XvN8YOhPq_mDUvyVxeq5wg/${photoId}`;
        formData.set("photo", photoUrl);
        return uploadProduct(_, formData);
    };
    const [state, dispatch] = useFormState(interceptAction, null);
    return (
        <div>
            <Link href="/home" className="size-15 relative top-2.5 bottom-0 right-0 left-5">
                <FaRegArrowAltCircleLeft className="size-10" />
            </Link>
            <form action={dispatch} className="p-5 flex flex-col gap-5">
                <label htmlFor="photo" className="border-2
                aspect-square flex items-center justify-center flex-col
                text-netural-300 border-neutral-300 rounded-md border-dashed
                cursor-pointer bg-center bg-cover"
                    style={{
                        backgroundImage: `url(${preview})`,
                    }}
                >
                    {preview === "" ? (
                        <>
                            <PhotoIcon className="w-20" />
                            <div className="text-neutral-400 text-sm">
                                Add Photo
                                {state?.fieldErrors.photo}
                            </div>
                        </>) : null}
                </label>
                <input onChange={onImageChange} type="file" id="photo" name="photo"
                    className="hidden"
                    accept="image/*" />
                <Input name="title" required placeholder="Title" type="text"
                    errors={state?.fieldErrors.title} />
                <Input name="price" type="number" required placeholder="Price"
                    errors={state?.fieldErrors.price} />
                <Input name="description" type="text" required
                    placeholder="Please describe the item."
                    errors={state?.fieldErrors.description} />
                <Button text="Upload" loadMsg="Uploading..." />
            </form>
        </div>
    )
}