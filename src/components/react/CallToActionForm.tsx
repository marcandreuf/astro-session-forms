import React, { useEffect, type FormEvent } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";


type FormValues = {
    csrfToken: string,
    username: string
}

function getFormData(d: FormValues) {
    const formData = new FormData();
    formData.append('csrfToken', d.csrfToken);
    formData.append('username', d.username);
    return formData;
}

export default function CtaForm({ csrfToken }: { csrfToken: string }) {
    const [formCsrfToken, setFormCsrfToken] = React.useState(csrfToken)    

    const { register, handleSubmit } = useForm<FormValues>()

    const submitToAstroPage: SubmitHandler<FormValues> = async (data) => {
        console.log(data);
        const formData = getFormData(data);

        const response = await fetch('/cta', {
            method: 'POST',
            body: formData
        });
    }

    async function submitToApi(data: FormValues) {
        const formData = getFormData(data);
        const response = await fetch("/api/cta", {
            method: "POST",
            body: formData,
        });
        const respData = await response.json();
        if (respData.message) {
            console.log('Response data message: ', respData.message);
        }
    }

    useEffect(() => {
        setFormCsrfToken(csrfToken)
    }, [])

    return (
        <div>
            <h2>React form To Astro Page</h2>
            {/* <form onSubmit={handleSubmit(submitToAstroPage)}> */}
            <form onSubmit={handleSubmit(submitToApi)}>
                <input {...register("csrfToken")} value={formCsrfToken} readOnly />
                <label>
                    Username:
                    <input type="text" {...register('username')} required />
                </label>
                <button>Submit</button>
            </form>

            <h2>React form To Astro Api</h2>
            <form onSubmit={handleSubmit(submitToAstroPage)}>
                <input {...register("csrfToken")} value={formCsrfToken} readOnly />
                <button>Submit</button>
            </form>
        </div>
    )
}