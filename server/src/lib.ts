export let IS_DEV = false

export function isDev(): boolean {
    return IS_DEV
}

export function setIsDev(b: boolean) {
    IS_DEV = b
}
