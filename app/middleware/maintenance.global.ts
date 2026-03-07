export default defineNuxtRouteMiddleware(to => {
    const config = useRuntimeConfig();

    if (!config.public.maintenance) return;

    if (to.path === "/maintenance") return;

    return navigateTo("/maintenance");
});
