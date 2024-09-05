/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    interface Locals {
        astro_session_session: {
            csrfToken: string
        },
    }
}