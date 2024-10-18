"use client"
import { updateNewUser } from '@/serverFunctions/handleUser';
import { consoleErrorWithToast } from '@/usefulFunctions/consoleErrorWithToast';
import React from 'react'
import { toast } from 'react-hot-toast';

//go over all fields you want with a form
//submit 
//update user

export default function Page() {

    async function submitForm() {
        try {
            await updateNewUser({
                completedUserSetup: true
            })

            toast.success("updated")
        } catch (error) {
            consoleErrorWithToast(error)
        }
    }

    return (
        <main>

            <form action={() => { }}>
                <button role='button'
                    onClick={submitForm}
                >Complete Setup</button>
            </form>

        </main>
    )
}
