/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    interface Locals {
        title: string,
        astroSession: {
            csrfToken: string,
            csrfSecret: string,
        },
    }
}
