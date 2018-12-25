<template>
    <div class="container is-fullhd">
        <Navbar />
        <router-view></router-view>
    </div>
</template>

<script>
import Navbar from "./views/components/navbar.vue";

export default {
    name: "app",
    components: {
        Navbar
    }
}
</script>

