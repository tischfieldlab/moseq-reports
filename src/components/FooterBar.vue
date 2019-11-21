<template>
    <footer id="myFooter">
        <!--<div class="container">
            <div class="row">
                <div class="col-sm-3">
                    <a href="#"><img class="navbar-brand" src="https://image.flaticon.com/icons/png/512/40/40508.png"></a>
                </div>
                <div class="col-sm-2">
                    <h5>Get started</h5>
                    <ul>
                        <li><a href="#">Downloads</a></li>
                    </ul>
                </div>
                <div class="col-sm-2">
                    <h5>About us</h5>
                    <ul>
                        <li><a href="#">Contact us</a></li>
                    </ul>
                </div>
                <div class="col-sm-2">
                    <h5>Support</h5>
                    <ul>
                        <li><a href="#">Help desk</a></li>
                    </ul>
                </div>
            </div>
        </div>-->
        <div class="footer-copyright">
            <img class="navbar-brand" style="height:32px;width:32px;" src="https://image.flaticon.com/icons/png/512/40/40508.png">
            <span>© 2019 Jay A. Tischfield Lab</span>
        </div>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'footer-bar',
});
</script>

<style scoped lang="scss">
#myFooter {
    background-color: #3c3d41;
    color: white;
    padding-top: 3px;
    position: bottom;
    bottom: 0;
    width: 100%;
}

#myFooter .footer-copyright {
    background-color: #333333;
    padding-top: 3px;
    padding-bottom: 3px;
    text-align: center;
}

#myFooter .row {
    margin-bottom: 0px;
}

#myFooter .navbar-brand {
    margin-top: 0px;
    height: 128px;
    width: 128px;
}

#myFooter .footer-copyright p {
    margin: 10px;
    color: #ccc;
}

#myFooter ul {
    list-style-type: none;
    padding-left: 0;
    line-height: 1.7;
}

#myFooter h5 {
    font-size: 18px;
    color: white;
    font-weight: bold;
    margin-top: 10px;
}

#myFooter h2 a{
    font-size: 50px;
    text-align: center;
    color: #fff;
}

#myFooter a {
    color: #d2d1d1;
    text-decoration: none;
}

#myFooter a:hover,
#myFooter a:focus {
    text-decoration: none;
    color: white;
}

@media screen and (max-width: 767px) {
    #myFooter {
        text-align: center;
    }
}

html{
    height: 100%;
}

body{
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    -webkit-flex-direction: column;
    height: 100%;
}

.content{
   flex: 1 0 auto;
   -webkit-flex: 1 0 auto;
   min-height: 200px;
}

#myFooter{
   flex: 0 0 auto;
   -webkit-flex: 0 0 auto;
}
</style>
