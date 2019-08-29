<template>
    <div id="navigation-bar">
        <div class="contianer">
            <b-navbar toggleable="lg" type="dark" variant="dark">
                <b-navbar-nav class="nav-text">
                    <b-navbar-brand href="/">Data Report</b-navbar-brand>
                    <b-nav-item href="/" right active>Home</b-nav-item>
                    <b-nav-item href="/data" right>Data</b-nav-item>
                    <b-nav-item href="/options" left>Options</b-nav-item>
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
</style>
