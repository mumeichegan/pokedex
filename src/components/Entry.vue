<script setup>
import { reactive } from 'vue';
import { POKEMON_TYPES } from '../modules/constants'
// import { useRootStore } from '../store/root'

// const root = useRootStore()

const props = defineProps(['pokemon', 'tabindex'])

const typeColors = reactive({
  a: '',
  b: ''
})

if (props.pokemon.types.length > 1) {
  typeColors.a = POKEMON_TYPES[props.pokemon.types[0].type.name].color
  typeColors.b = POKEMON_TYPES[props.pokemon.types[1].type.name].color
}
else {
  typeColors.a = POKEMON_TYPES[props.pokemon.types[0].type.name].color
  typeColors.b = null
  
}

</script>

<template>
  <router-link 
    :to="`/pokemon/${props.pokemon.id}`"
    block
    relative
    w="100%"
    h="0"
    pb="130%"
    b="1 solid #ccc rd-3px"
    overflow="hidden"
    href="#"
    :tabindex="props.tabindex"
    >
    <div
      absolute
      w="100%"
      h="100%"
      left="0"
      top="0"
      flex="~ col"
      bg="#eee"
      >
      <div
        class="thumbnail"
        w="65%"
        m-x="auto"
        mt="15%">
        <div
          block
          w="100%"
          h="0"
          pb="100%"
          relative>
          <img 
            absolute
            w="100%"
            h="100%"
            left="0"
            top="0"
            :src="props.pokemon.sprites.front_default" 
            alt="">
          
          <div
            absolute
            w="100%"
            left="0"
            right="0"
            bottom="-15px sm:-9px"
            h="8px"
            flex
            justify="center">
            <span 
              w="10px" 
              h="10px" 
              :style="{ 
                backgroundColor: typeColors.a,
                transform: `scaleX(${typeColors.b ? '1' : '2'})`,
                borderRadius: typeColors.b ? '2px' : '1px'
              }"
              relative>
            </span>
            <span 
              v-show="typeColors.b"
              w="10px" 
              h="10px" 
              :style="{ 
                backgroundColor: typeColors.b,
                
              }"
              b="rd-2px"
              relative 
              >
            </span>
          </div>


        </div>
      </div>

      <div mt="auto">
        <div 
          mt="5%"
          m="x-auto"
          block
          text="center #000"
          case-capital
          truncate
          w="85%"
          >
          {{ props.pokemon.name }}
        </div>
        <div 
          m="y-5%"
          block
          text="center 14px #532341"
          font="semibold">
          # {{ props.pokemon.id }}
        </div>
      </div>

    </div>
  </router-link>
</template>
