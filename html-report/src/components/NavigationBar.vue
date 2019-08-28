<template>
    <div class="navigation-bar">
        <div>
            <b-navbar type="dark" variant="dark">
                <b-navbar-nav>
                <b-navbar-brand href="#">Data Report</b-navbar-brand>
                <b-nav-item href="#" right>Home</b-nav-item>
                <b-nav-item href="#" right>Data</b-nav-item>
                <b-nav-item href="#" left>Options</b-nav-item>
                </b-navbar-nav>
            </b-navbar>
        </div>
    </div>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
.b-nav-item {
    color: white;
}
</style>
