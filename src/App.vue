<script setup>
import { onMounted, ref, nextTick, reactive } from 'vue'
import InfiniteScroll from './modules/infinite-scroll'

import { inject } from 'vue';

import { useRootStore } from './store/root'

import { gsap } from 'gsap'
import Flip from 'gsap/dist/Flip'


gsap.registerPlugin(Flip);


const root = useRootStore()

const clickedEntryRects = inject('clickedEntryRects')

const scrollerEl = ref(null)
const scrollerItemEl = ref(null)

onMounted(() => {
  if (import.meta.env.MODE === 'production') {
    
    // const infiniteScroll = new InfiniteScroll({
    //   scrollerEl,
    //   scrollerItemEl,
    //   root
    // })
    // infiniteScroll.run()

    scrollerEl.value.addEventListener('scroll', () => {
      const infiniteScroll = new InfiniteScroll({
        scrollerEl,
        scrollerItemEl,
        root
      })
      infiniteScroll.run()  

    })
    
  }
})

function updateClickedEntryRects(event) {
  const outlineEl = event.currentTarget
  const imageEl = event.currentTarget.querySelector('.thumbnail')
  clickedEntryRects.imageRect = imageEl.getBoundingClientRect()
  clickedEntryRects.outlineRect = outlineEl.getBoundingClientRect()

  clickedEntryRects.imageSrc = imageEl.querySelector('img').src

  clickedEntryRects.initialImageEl = imageEl
  clickedEntryRects.initialOutlineEl = outlineEl

  isCurrentViewDetails.value = true

  scrollerItemElStyle.transition = scrollerItemElStyleShrunk.transition
  nextTick(() => {
    scrollerItemElStyle.transform = scrollerItemElStyleShrunk.transform
  })

}

const isCurrentViewDetails = ref(false)
const scrollerItemElStyle = reactive({
  transition: null,
  transform: null,
  opacity: '1'
})
const scrollerItemElStyleShrunk = {
  transition: 'transform .35s ease-in-out, opacity .3s',
  transform: 'scale(.85)',
  opacity: '0'
}

let vClientInfiniteScroll = {}
if (
  !import.meta.env.SSR 
  && import.meta.env.MODE === 'development'
) {
  let loadedPokemonCount = 0
  vClientInfiniteScroll = {
    updated: () => {
      loadedPokemonCount++
      // if (loadedPokemonCount === root.pageLimit) {
        
      if (loadedPokemonCount === root.pageInitialLimit) {
        // const infiniteScroll = new InfiniteScroll({
        //   scrollerEl,
        //   scrollerItemEl,
        //   root
        // })
        // infiniteScroll.run()


        scrollerEl.value.addEventListener('scroll', () => {
          const infiniteScroll = new InfiniteScroll({
            scrollerEl,
            scrollerItemEl,
            root
          })
          infiniteScroll.run()  

        })
        
      }
    }
  }
}

const originalImageEl = ref(null)

const imageElFLIPState = reactive({
  width: null,
  height: null,
  top: null,
  left: null,
})

const originalOutlineEl = ref(null)
const outlineElFLIPState = reactive({
  width: null,
  height: null,
  top: null,
  left: null,
})

const isImageTransitionEnd = ref(true)

function onBeforeLeave(el) {
  if (el.id === 'details') {
  
    const imageEl = el.querySelector('#imageEl')
    imageEl.style.visibility = 'hidden'

    const outlineEl = el.querySelector('#outlineEl')
    outlineEl.style.visibility = 'hidden'

    isImageTransitionEnd.value = false

    isCurrentViewDetails.value = false
    clickedEntryRects.initialOutlineEl.focus()
    
  }
}

function onLeave(el, done) {
  if (el.id === 'details') {
    
    const detailsEl = el.querySelector('#detailsEl')
    detailsEl.style.visibility = 'hidden'
    
    // imageEl
    const imageEl = el.querySelector('#imageEl')
    const imageElBounds = imageEl.getBoundingClientRect()

    imageElFLIPState.width = imageElBounds.width + 'px'
    imageElFLIPState.height = imageElBounds.height + 'px'
    imageElFLIPState.top = imageElBounds.top + 'px'
    imageElFLIPState.left = imageElBounds.left + 'px'

    // outlineEL
    const outlineEl = el.querySelector('#outlineEl')
    const outlineElBounds = outlineEl.getBoundingClientRect()

    outlineElFLIPState.width = outlineElBounds.width + 'px'
    outlineElFLIPState.height = outlineElBounds.height + 'px'
    outlineElFLIPState.top = outlineElBounds.top + 'px'
    outlineElFLIPState.left = outlineElBounds.left + 'px'
    
    
    nextTick(() => {
      const originalImageElState = Flip.getState(originalImageEl.value)
      const originalOutlineElState = Flip.getState(originalOutlineEl.value)

      scrollerItemElStyle.transition = ''
      scrollerItemElStyle.transform = ''

      nextTick(() => {
        const imageElTargetBounds = clickedEntryRects.initialImageEl.getBoundingClientRect()
        const outlineElTargetBounds = clickedEntryRects.initialOutlineEl.getBoundingClientRect()

        scrollerItemElStyle.transform = scrollerItemElStyleShrunk.transform
        nextTick(() => {
          scrollerItemElStyle.transition = scrollerItemElStyleShrunk.transition
          nextTick(() => {
            scrollerItemElStyle.transform = ''
            
            imageElFLIPState.width = imageElTargetBounds.width + 'px'
            imageElFLIPState.height = imageElTargetBounds.height + 'px'
            imageElFLIPState.top = imageElTargetBounds.top + 'px'
            imageElFLIPState.left = imageElTargetBounds.left + 'px'

            outlineElFLIPState.width = outlineElTargetBounds.width + 'px'
            outlineElFLIPState.height = outlineElTargetBounds.height + 'px'
            outlineElFLIPState.top = outlineElTargetBounds.top + 'px'
            outlineElFLIPState.left = outlineElTargetBounds.left + 'px'
            
            nextTick(() => {
              Flip.from(originalImageElState, {
                  duration: .725,
                  ease: 'power3.out',
                  scale: true,
                  onComplete: () => {
                    isImageTransitionEnd.value = true
                    done()
                  }
              })

              Flip.from(originalOutlineElState, {
                duration: .35,
                ease: 'power4.inOut',
                scale: true,
              })

            })

          })
        })

        
      })

    })
  }
}



</script>

<template>
    <HeaderBar
      :style="{ zIndex: !isImageTransitionEnd ? 100 : 'unset' }">
    </HeaderBar>

    <main>
      <article 
        top="55px"
        absolute
        bottom="0"
        left="0"
        w="100%">
        <div 
          ref="scrollerEl" 
          overflow="y-scroll" 
          h="100%">
          <ul
            ref="scrollerItemEl"
            class="g0"
            v-client-infinite-scroll
            :style="{
              transformOrigin: scrollerEl
                ? `${scrollerEl.offsetWidth / 2}px ${scrollerEl.scrollTop + scrollerEl.offsetHeight / 2}px`
                : null,

              transition: scrollerItemElStyle.transition,
              transform: scrollerItemElStyle.transform,
              opacity: scrollerItemElStyle.opacity

            }">
            
            
              <li 
                class="g0-gc"
                v-for="pokemon of root.pokemons"
                :key="pokemon.id">
                <Entry
                  :tabindex="isCurrentViewDetails && -1"
                  :pokemon="pokemon"
                  @click.prevent="updateClickedEntryRects($event)"></Entry>
              </li>

              <template v-if="!root.hasFetchedAllPokemons">
                <li
                  class="g0-gc"
                  v-for="a of root.pageInitialLimit"
                  >
                  <EntryPlaceholder></EntryPlaceholder>
                </li>
              </template>
              
            
          </ul>
          
        </div>
        
      </article>

    </main>

    
    <!-- <router-view></router-view> -->

    <router-view v-slot="{ Component }">
      <transition
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <component :is="Component"></component>
      </transition>
    </router-view>

    <div
      v-if="!isImageTransitionEnd"
      ref="originalOutlineEl"
      absolute
      z="50"
      :style="{
        width: outlineElFLIPState.width,
        height: outlineElFLIPState.height,
        top: outlineElFLIPState.top,
        left: outlineElFLIPState.left
      }"
      bg="#eee">
    </div>

    <div
      v-if="!isImageTransitionEnd"
      ref="originalImageEl"
      absolute
      text="0"
      z="100"
      :style="{
        width: imageElFLIPState.width,
        height: imageElFLIPState.height,
        top: imageElFLIPState.top,
        left: imageElFLIPState.left
      }">
      <img 
        w="100%"
        h="100%"
        :src="clickedEntryRects.imageSrc" alt="">
    </div>

</template>

<style scoped>
.g0 {
  max-width: 1080px;
  margin: 0 auto;
  text-align: center;
  padding: 8px;
}

.g0-gc {
  display: inline-block;
  width: 125px;
  padding: 8px;
}

@media (max-width: 395px) {
  .g0-gc {
    width: 150px;
  }
}

@supports (display: grid) and (grid-template-columns: repeat(auto-fill, minmax(125px, 1fr))) and (gap: 16px) {
  .g0 {
    
    text-align: unset;
    display: grid;
    gap: 16px;
    padding: 16px;
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  }
  .g0-gc {
    padding: unset;
    width: auto;
    display: unset;
  }
}

/* .scrollerItem {
  transition: transform 3.5s ease-in-out, opacity .3s;
}
.shrunk {
  transform: scale(.85);    
  opacity: 0;
} */
</style>
