
import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";


type FormValues = {
    csrfToken: string,
    username: string
}

function getFormData(d: FormValues) {
    console.log(d);
    const formData = new FormData();
    formData.append('csrfToken', d.csrfToken);
    formData.append('username', d.username);
    return formData;
}

export default function CtaFormAPI({ csrfToken }: { csrfToken: string }) {
    const [formCsrfToken, setFormCsrfToken] = React.useState(csrfToken)
    const { register, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            csrfToken: formCsrfToken,
            username: 'nameTestApi'
        }
    })

    const submitToAstroPage: SubmitHandler<FormValues> = async (data) => {
        const formData = getFormData(data);
        console.log(formData);

        const response = await fetch('/cta', {
            method: 'POST',
            body: formData
        });
        console.log(response);
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
            <h2>React form To Astro Api</h2>
            <form onSubmit={handleSubmit(submitToApi)}>
                <input type="text" {...register("csrfToken")} />
                <label>
                    Username:
                    <input type="text" {...register('username')} required />
                </label>
                <button>Submit</button>
            </form>
        </div>
    )
}