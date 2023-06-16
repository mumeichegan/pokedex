<script setup>
const props = defineProps(['size'])

</script>

<template>
<div class="spinner"
    :style="{
        width: props.size,
        height: props.size
    }">
    <div 
        v-for="n of 12"
        class="bar"></div>
  <!-- <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div> -->
</div>
</template>

<style>
div.spinner {
  position: relative;
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
}

div.spinner div {
  width: 6%;
  height: 16%;
  background: #2d2d2d;
  position: absolute;
  left: 50%;
  top: 50%;
  opacity: 0;
  border-radius: 50px;
  -webkit-box-shadow: 0 0 3px rgba(0,0,0,0.2);
  box-shadow: 0 0 3px rgba(0,0,0,0.2);
  -webkit-animation: fade 1s linear infinite;
  animation: fade 1s linear infinite;
}

@keyframes fade {
  from {opacity: 1;}
  to {opacity: 0.25;}
}

div.spinner div.bar:nth-of-type(1) {
  -webkit-transform:rotate(0deg) translate(0, -130%);
  transform:rotate(0deg) translate(0, -130%);
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}    

div.spinner div.bar:nth-of-type(2) {
  -webkit-transform:rotate(30deg) translate(0, -130%); 
  transform:rotate(30deg) translate(0, -130%); 
  -webkit-animation-delay: -0.9167s;
  animation-delay: -0.9167s;
}

div.spinner div.bar:nth-of-type(3) {
  -webkit-transform:rotate(60deg) translate(0, -130%); 
  transform:rotate(60deg) translate(0, -130%); 
  -webkit-animation-delay: -0.833s;
  animation-delay: -0.833s;
}
div.spinner div.bar:nth-of-type(4) {
  -webkit-transform:rotate(90deg) translate(0, -130%); 
  transform:rotate(90deg) translate(0, -130%); 
  -webkit-animation-delay: -0.7497s;
  animation-delay: -0.7497s;
}
div.spinner div.bar:nth-of-type(5) {
  -webkit-transform:rotate(120deg) translate(0, -130%); 
  transform:rotate(120deg) translate(0, -130%); 
  -webkit-animation-delay: -0.667s;
  animation-delay: -0.667s;
}
div.spinner div.bar:nth-of-type(6) {
  -webkit-transform:rotate(150deg) translate(0, -130%); 
  transform:rotate(150deg) translate(0, -130%); 
  -webkit-animation-delay: -0.5837s;
  animation-delay: -0.5837s;
}
div.spinner div.bar:nth-of-type(7) {
  -webkit-transform:rotate(180deg) translate(0, -130%); 
  transform:rotate(180deg) translate(0, -130%); 
  -webkit-animation-delay: -0.5s;
  animation-delay: -0.5s;
}
div.spinner div.bar:nth-of-type(8) {
  -webkit-transform:rotate(210deg) translate(0, -130%); 
  transform:rotate(210deg) translate(0, -130%); 
  -webkit-animation-delay: -0.4167s;
  animation-delay: -0.4167s;
}
div.spinner div.bar:nth-of-type(9) {
  -webkit-transform:rotate(240deg) translate(0, -130%); 
  transform:rotate(240deg) translate(0, -130%); 
  -webkit-animation-delay: -0.333s;
  animation-delay: -0.333s;
}
div.spinner div.bar:nth-of-type(10) {
  -webkit-transform:rotate(270deg) translate(0, -130%); 
  transform:rotate(270deg) translate(0, -130%); 
  -webkit-animation-delay: -0.2497s;
  animation-delay: -0.2497s;
}
div.spinner div.bar:nth-of-type(11) {
  -webkit-transform:rotate(300deg) translate(0, -130%); 
  transform:rotate(300deg) translate(0, -130%); 
  -webkit-animation-delay: -0.167s;
  animation-delay: -0.167s;
}
div.spinner div.bar:nth-of-type(12) {
  -webkit-transform:rotate(330deg) translate(0, -130%); 
  transform:rotate(330deg) translate(0, -130%); 
  -webkit-animation-delay: -0.0833s;
  animation-delay: -0.0833s;
}
</style>