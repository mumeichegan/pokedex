<script setup>
import { nextTick, ref, reactive, onMounted } from 'vue';
import { inject } from 'vue'
import { useRoute } from 'vue-router'

import { useRootStore } from '../store/root'

import { gsap } from 'gsap'
import Flip from 'gsap/dist/Flip'
import FilledDefinitionTable from './FilledDefinitionTable.vue';
import { POKEMON_STATS_NAMING, POKEMON_TYPES } from '../modules/constants';

gsap.registerPlugin(Flip);

const route = useRoute()

const root = useRootStore()

const pokemon = reactive(root.getPokemonById(+route.params.id)[0])

const { imageRect, outlineRect } = inject('clickedEntryRects')

const originalImageEl = ref(null)
const imageEl = ref(null)

const detailsEl = ref(null)

const originalOutlineEl = ref(null)
const outlineEl = ref(null)

const outlineElFLIPState = reactive({
    width: outlineRect.width + 'px',
    height: outlineRect.height + 'px',
    top: outlineRect.top + 'px',
    left: outlineRect.left + 'px',
})

const imageElFLIPState = reactive({
    width: imageRect.width + 'px',
    height: imageRect.height + 'px',
    top: imageRect.top + 'px',
    left: imageRect.left + 'px'
})

const isOutlineTransitionEnd = ref(false)
const isImageTransitionEnd = ref(false)

onMounted(() => {

    requestAnimationFrame(() => {

        const originalOutlineElState = Flip.getState(originalOutlineEl.value)
        const finalOutlineElRect = outlineEl.value.getBoundingClientRect()
        outlineElFLIPState.width = finalOutlineElRect.width + 'px'
        outlineElFLIPState.height = finalOutlineElRect.height + 'px'
        outlineElFLIPState.top = finalOutlineElRect.top + 'px'
        outlineElFLIPState.left = finalOutlineElRect.left + 'px'
        outlineElFLIPState.backgroundColor = '#eee'
        
        const originalImageElState = Flip.getState(originalImageEl.value)
        const finalImageElRect = imageEl.value.getBoundingClientRect()
        imageElFLIPState.width = finalImageElRect.width + 'px'
        imageElFLIPState.height = finalImageElRect.height + 'px'
        imageElFLIPState.top = finalImageElRect.top + 'px'
        imageElFLIPState.left = finalImageElRect.left + 'px'


        nextTick(() => {
            Flip.from(originalOutlineElState, {
                delay: .1,
                duration: .5,
                ease: 'power4.out',
                scale: true,
                onComplete: () => isOutlineTransitionEnd.value = true
            })

            gsap.from(detailsEl.value, {
                delay: .2,
                duration: .4,
                scale: .75,
                y: 25,
                autoAlpha: 0,
                ease: 'power3.inOut'
            })

            Flip.from(originalImageElState, {
                delay: .2,
                duration: .725,
                // ease: 'expo.out',
                ease: 'power3.out',
                scale: true,
                onComplete: () => isImageTransitionEnd.value = true
            })
        })
    })

})

// profile
const profileEntries = [
    { label: 'Height', value: pokemon.height + ' dm' },
    { label: 'Weight', value: pokemon.weight + ' hg' },
    { label: 'Capture Rate', value: '' }, // species
    { label: 'Gender Rate', value: '' }, // species
    { label: 'Hatch Steps', value: '' }, // species
    { label: 'Abilities', value: pokemon.abilities.map(ability => ability.ability.name).join(', ') }
]

// moves
const moveDropdowns = ref(pokemon.moves.map(move => ({
    moveUrl: move.move.url,
    isDroppedDown: false
})))

</script>
<template>
    <article
        id="details"
        absolute
        w="100%"
        h="100%"
        top="0"
        left="0"
        z="5"
        flex
        overflow="hidden">
        <!-- original outlineEl / bg -->
        <!-- id="outlineEl" -->
        <div
            
            ref="originalOutlineEl"
            z="1"
            absolute
            :style="{
                width: outlineElFLIPState.width,
                height: outlineElFLIPState.height,
                top: outlineElFLIPState.top,
                left: outlineElFLIPState.left,
                backgroundColor: outlineElFLIPState.backgroundColor,

                visibility: isOutlineTransitionEnd ? 'hidden' : 'visible'
            }"
            >
        </div>

        <!-- original imageEl -->
        <div
            ref="originalImageEl"
            z="10"
            absolute
            :style="{
                width: imageElFLIPState.width,
                height: imageElFLIPState.height,
                top: imageElFLIPState.top,
                left: imageElFLIPState.left
            }">
            
            <img 
                v-show="!isImageTransitionEnd"
                w="100%"
                h="100%"
                :src="pokemon.sprites.front_default" alt="">
        </div>

        <!-- outlineEl / bg-->
        <!-- invisible -->
        <div
            ref="outlineEl"
            id="outlineEl"
            :style="{
                visibility: isOutlineTransitionEnd ? 'visible' : 'hidden'
            }"

            absolute
            w="100%"
            h="100%"
            top="0"
            left="0"
            bg="#eee"
            z="1"></div>
        <div
            id="detailsEl"
            ref="detailsEl"
            relative
            z="2"
            mb="auto"
            mt="auto"
            h="90%"
            sm:grow="1"
            
            :style="{ 
                overflowY: isImageTransitionEnd ? 'scroll' : 'hidden'
            }"
            invisible>
            <div
                w="82.5%"
                m="x-auto"
                flex="~ col"
                sm:max-w="512px"
                bg="white"
                
                >
                <header
                    bg="#63BBBF"
                    pa="5"
                    text="center #fff"
                    relative>
                    {{ pokemon.name.charAt(0).toUpperCase() +  pokemon.name.slice(1) }}

                    <!-- <span
                        ml="5"
                        text="#fff"
                        ># {{ pokemon.order }}</span> -->
                    <span
                        right="5%"
                        absolute
                        top="50%"
                        translate="y-[-50%]"
                        text="#fff"
                        ># {{ pokemon.id }}</span>

                        <router-link
                            to="/"
                            absolute
                            top="50%"
                            translate-y="-50%"
                            left="10px"
                            w="40px"
                            h="20px">
                            <span
                                w="15px"
                                h="4px"
                                b="rd-2px"
                                bg="#333"
                                absolute
                                top="50%"
                                translate="x-[-50%] y-[-50%]"
                                left="55%"></span>
                            <span
                                absolute
                                w="0"
                                h="0"
                                b="solid 6px transparent rd-2px"
                                border-r="#333"
                                top="50%"
                                left="4px"
                                translate-y="-50%"></span>
                        </router-link>
                </header>

                <section
                    flex
                    pa="5">
                    <!-- image and type -->
                    <div
                        w="28.25%"
                        grow="0"
                        flex="col">
                        <!-- imageEl -->
                        <div
                            id="imageEl"
                            ref="imageEl"

                            w="100%"
                            h="0"
                            pb="100%"
                            relative>
                            <!-- <div
                                absolute
                                w="100%"
                                h="100%"
                                bg="#eee">
                            </div> -->
                            
                            <img 

                                

                                v-show="isImageTransitionEnd"
                                absolute
                                w="100%"
                                h="100%"
                                :src="pokemon.sprites.front_default" alt="">
                        </div>
                        <!-- type -->
                        <div 
                            sm:flex="~ row"
                            flex="~ col"
                            mt="10%"
                            w="100%"
                            b="1px #ddd solid rd-3px">
                            <div
                                bg="#eee"
                                p="x-4px y-4px"
                                text="12px"
                                flex
                                justify="center"
                                items="center">
                                Type
                            </div>
                            <div
                                grow="1"
                                pa="5px"
                                flex="~ col">
                                <div 
                                    v-for="type of pokemon.types"
                                    class="type-palette sm:text-10px"
                                    :style="{
                                        backgroundColor: POKEMON_TYPES[type.type.name].color
                                    }"
                                    case-upper
                                    p="y-6px"
                                    text="center white 7px"
                                    b="rd-2px">
                                    {{ type.type.name }}
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- main stats -->
                    <div 
                        grow="1"
                        ml="7.25%">
                        <div>
                            <div 
                                v-for="stat of pokemon.stats"
                                flex
                                items="center"
                                class="[&:not(:first-child)]:mt-3.5%">
                                <span
                                    grow="0"
                                    w="sm:25% 30%"
                                    text="sm:16px 12px"
                                    >{{ POKEMON_STATS_NAMING[stat.stat.name] }}</span>
                                <span 
                                    grow="1"
                                    b="rd-3px"
                                    pa="sm:6px 4px"
                                    ml="sm:12.5% 10%"
                                    bg="#eee"
                                    relative
                                    overflow="hidden"
                                    flex
                                    items="center"
                                    >
                                    <span 
                                        relative z="1" 
                                        p="l-1.5"
                                        text="#fff sm:14px 12px">{{ stat.base_stat }}</span>
                                    <span
                                        absolute
                                        left="0"
                                        top="0"
                                        bottom="0"
                                        :style="{ 
                                            width: `${stat.base_stat}%` 
                                        }"
                                        bg="#CB4D82"></span>
                                    
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- genera and flavor text entry -->
                <section
                    p="x-5">
                    <!-- <div
                        flex
                        b="1px solid #ddd rd-3px">
                        <p
                            pa="12px"
                            leading="6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, dolorem.</p>
                        <p
                            bg="#eee"
                            flex
                            justify="center"
                            p="x-5%"
                            ml="auto"
                            items="center">genera</p>
                    </div> -->
                    <Suspense>
                        <DefinitionTable 
                            
                            :pokemon-species-id="pokemon.species.url.split('/').slice(-2, -1)[0]">
                        </DefinitionTable>
                        <template #fallback>
                            <div
                                pa="2"
                                b="rd-3px 1px solid #eee"
                                text="center #aaa"
                                flex
                                justify="center"
                                items="center">
                                <Loading size="25px"></Loading>
                            </div>
                            
                        </template>
                    </Suspense>
                    

                    
                </section>

                <!-- profile -->
                <section
                    pa="5">
                    <!-- profie header -->
                    <header
                        bg="#ddd"
                        p="x-5 y-2.5"
                        mb="2.5"
                        >Profile
                    </header>
                    <!-- profie stats -->
                    <div
                        flex="~ wrap"
                        p="x-5">
                        <template v-for="profileEntry of profileEntries">
                            <template v-if="['height', 'weight', 'abilities'].indexOf(profileEntry.label.toLowerCase()) >= 0">
                                <Suspense>
                                    <SimpleStat 
                                        :label="profileEntry.label"
                                        :value="profileEntry.value"
                                        :value-font-size="profileEntry.label === 'Abilities' && '10px'">
                                    </SimpleStat>
                                </Suspense>
                            </template>
                            <template v-else>
                                <Suspense>
                                    <SimpleStat 
                                        :label="profileEntry.label"
                                        :lookup-field="({
                                            'Capture Rate': 'capture_rate',
                                            'Gender Rate': 'gender_rate',
                                            'Hatch Steps': 'hatch_counter'
                                        })[profileEntry.label]">
                                    </SimpleStat>
                                    <template #fallback>
                                        <div 
                                            sm:basis="50%"
                                            basis="100%"
                                            leading="8"
                                            flex
                                            items="center">
                                            <span
                                                w="42.5%"
                                                text="75%"
                                                font="semibold"
                                                >{{ profileEntry.label }}</span>
                                            <span
                                                sm:ml="unset"
                                                ml="auto"
                                                flex>
                                                <Loading size="25px"></Loading>
                                            </span>
                                        </div>
                                    </template>
                                </Suspense>
                            </template>
                        </template>
                        <!-- <div 
                            v-for="profileEntry of profileEntries"
                            sm:basis="50%"
                            basis="100%"
                            leading="8"
                            flex
                            items="center">
                            <span
                                w="42.5%"
                                text="80%"
                                >{{ profileEntry.label }}</span>
                            <span
                                text="#aaa"
                                sm:ml="unset"
                                ml="auto"
                                >{{ profileEntries.value }}</span>
                        </div> -->
                    </div>
                </section>

                <!-- damage relations -->
                <section
                    p="x-5 b-5">
                    <!-- damage relations header -->
                    <header
                        bg="#ddd"
                        p="x-5 y-2.5"
                        mb="2.5">Damage Relations
                    </header>
                    <div>

                        <!-- <div 
                            flex
                            v-for="n of 6"
                            class="damage-relation">
                            <div 
                                bg="#eee"
                                p="y-1"
                                b="solid 1px #ddd"
                                text="11px"
                                w="85px"
                                flex
                                justify="center"
                                items="center"
                                shrink="0">
                                {{ n == 1 ? '2x from': n == 2 ? '0.5x to' : n == 3 ? 'immune to' : 'ineffective to' }}
                            </div>
                                
                            <div 
                                flex="~ wrap">
                                <span
                                    bg="purple" 
                                    p="y-6px"
                                    case-upper
                                    text="center white 10px"
                                    w="90px"
                                    flex
                                    justify="center"
                                    items="center"
                                    class="type-palette">
                                    electric
                                </span>
                            </div>
                        </div> -->

                        <Suspense>
                            <FilledDefinitionTable
                                :definition-group-ids="pokemon.types.map(type => type.type.url.split('/').slice(-2, -1)[0])"
                            ></FilledDefinitionTable>
                            <template #fallback>
                                <div
                                    flex
                                    justify="center">
                                    <Loading size="25px"></Loading>
                                </div>
                                
                            </template>
                        </Suspense>
                        
                        
                    </div>
                </section>

                <!-- evolutions -->
                <section
                    p="x-5 b-5">
                    <!-- evolutions header -->
                    <header
                        bg="#ddd"
                        p="x-5 y-2.5"
                        mb="2.5">
                        Evolutions
                    </header>

                    <Suspense>
                        <FlowDefinition></FlowDefinition>
                        <template #fallback>
                            <div
                                flex
                                justify="center"
                                p="t-4 b-2">
                                <Loading size="25px"></Loading>
                            </div>
                        </template>
                    </Suspense>
                </section>

                <!-- moves -->
                <section
                    p="x-5 b-5">
                    <!-- moves header -->
                    <header
                        bg="#ddd"
                        p="x-5 y-2.5"
                        mb="2.5">
                        Moves
                    </header>

                    <template v-if="pokemon.moves.length > 0">
                        <a
                            v-for="(move, index) of pokemon.moves"
                            block
                            b="1px solid #ddd rd-3px"
                            href="#"
                            class="[&:not(:first-of-type)]:mt-2.5%"
                            @click.prevent="moveDropdowns[index].isDroppedDown = !moveDropdowns[index].isDroppedDown">
                            <!-- move entry -->
                            <div
                                p="x-2 y-2"
                                flex
                                items="center">
                                <div
                                    :style="{
                                        transition: 'transform .35s, color .35s',
                                        transform: `rotate(${moveDropdowns[index].isDroppedDown && '-45deg'})`,
                                        color: moveDropdowns[index].isDroppedDown && '#ccc'
                                    }">+</div>
                                <div
                                    ml="auto">
                                    {{ move.move.name }}
                                </div>
                            </div>
                            <!-- move details -->
                            <div
                                v-if="moveDropdowns[index].isDroppedDown">
                                <Suspense>
                                    <DefinitionColumnsWithHeading
                                        :move-url="moveDropdowns[index].moveUrl">
                                    </DefinitionColumnsWithHeading>
                                    <template #fallback>
                                        <div 
                                            flex
                                            justify="center"
                                            pb="4">
                                            <Loading size="25px"></Loading>
                                        </div>
                                        
                                    </template>
                                </Suspense>
                                
                            </div>
                            
                        </a>
                    </template>
                    <template v-else>-</template>
                </section>

            </div>
        </div>
        
    </article>    
</template>

<style>
.type-palette {
    text-shadow: 1px 1px 1px #666;
}

</style>