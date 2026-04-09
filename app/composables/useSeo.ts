export const useSeo = (seo: { title: string; description: string; image?: string; path?: string }) => {
    const config = useRuntimeConfig();

    const baseUrl = "https://dotuquonline.com"; // nanti bisa kita pindah ke config
    const url = seo.path ? `${baseUrl}${seo.path}` : baseUrl;

    useSeoMeta({
        title: seo.title,
        description: seo.description,

        ogTitle: seo.title,
        ogDescription: seo.description,
        ogImage: seo.image || "/default.jpg",
        ogType: "website",
        ogUrl: url,

        twitterCard: "summary_large_image",
        twitterTitle: seo.title,
        twitterDescription: seo.description,
        twitterImage: seo.image || "/default.jpg",

        robots: "index, follow",
    });

    useHead({
        link: [
            {
                rel: "canonical",
                href: url,
            },
        ],
    });
};
