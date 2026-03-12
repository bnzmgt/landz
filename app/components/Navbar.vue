<script setup>
import { PhMagnifyingGlass, PhHeart, PhList } from "@phosphor-icons/vue";

const menuOpen = ref(false);
</script>

<template>
    <header class="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <button class="lg:hidden" @click="menuOpen = !menuOpen">
                <PhList size="22" />
            </button>

            <nav class="hidden lg:flex flex-1 space-x-6 text-[11px] font-bold uppercase tracking-widest">
                <NuxtLink to="/" class="hover:text-gray-400 transition">Home</NuxtLink>

                <NuxtLink to="/categories" class="hover:text-gray-400 transition">Categories</NuxtLink>
            </nav>

            <div class="flex-shrink-0 text-center">
                <NuxtLink to="/" class="text-2xl font-light tracking-[0.3em] uppercase">
                    Dotuqu
                    <span class="font-bold">Online</span>
                </NuxtLink>
            </div>

            <div class="flex-1 flex justify-end space-x-4">
                <PhMagnifyingGlass size="20" class="text-gray-600" />

                <PhHeart size="20" class="text-gray-600" />
            </div>
        </div>

        <div v-if="menuOpen" class="lg:hidden border-t border-gray-100 px-4 py-4 space-y-4 text-sm uppercase tracking-widest">
            <NuxtLink to="/">Home</NuxtLink>

            <NuxtLink to="/categories">Categories</NuxtLink>
        </div>
    </header>
</template>
