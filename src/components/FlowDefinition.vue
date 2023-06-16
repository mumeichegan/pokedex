<script setup>
import { 
    EVO_TRIGGER_DESCP_BY_TRIGGER_TYPE, 
    SPRITES_URL
} from '../modules/constants';
import { 
    pokemonSpecies as pokemonSpeciesContainer,
    pokemonEvolutionChain as pokemonEvolutionChainContainer
} from '../modules/request-containers'

// import { useRootStore } from '../store/root';

// const root = useRootStore()

const pokemonSpecies = await pokemonSpeciesContainer.promise

// const imageSrcBaseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'
// const imageSrcExtension = '.png'

const imageSrcBaseUrl = SPRITES_URL
const imageSrcExtension = ''

let fromSpecies, toSpecies, evolutionFlow = []

const selfSpecies = {
    name: pokemonSpecies.name,
    imageSrc: imageSrcBaseUrl
        + pokemonSpecies.id
        + imageSrcExtension
    
}

// evolution chain does not exist
if (!('url' in pokemonSpecies.evolution_chain)) {

}
// evolution chain exists
else {

    const getPokemonEvolutionChainPromise = async () => 
        await ((await fetch(pokemonSpecies.evolution_chain.url)).json())
    pokemonEvolutionChainContainer.promise = getPokemonEvolutionChainPromise()
    const pokemonEvolutionChain = await pokemonEvolutionChainContainer.promise
    
    const currentEvolutionChain = pokemonEvolutionChain.chain
    
    // from - self as right
    if (!pokemonSpecies.evolves_from_species) {
        fromSpecies = null
    }
    else {
        fromSpecies = {
            name: pokemonSpecies.evolves_from_species.name,
            imageSrc: imageSrcBaseUrl 
                + pokemonSpecies.evolves_from_species.url.split('/').slice(-2, -1)[0]
                + imageSrcExtension

        }
        selfSpecies.details = findNextEvolutionChain(
            currentEvolutionChain,
            fromSpecies.name,
            selfSpecies.name
        ).evolution_details

        evolutionFlow.push([fromSpecies, selfSpecies])
        
    }
    // to - self as left
    const nextEvolutionChain = findNextEvolutionChain(
        currentEvolutionChain, 
        pokemonSpecies.name
    )

    if (!nextEvolutionChain) {
        toSpecies = null
    }
    else if (Object.prototype.toString.call(nextEvolutionChain) === '[object Array]') {
        for (let i = 0; i < nextEvolutionChain.length; i++) {
            toSpecies = {
                name: nextEvolutionChain[i].species.name,
                imageSrc: imageSrcBaseUrl 
                    + nextEvolutionChain[i].species.url.split('/').slice(-2, -1)[0]
                    + imageSrcExtension,
                details: nextEvolutionChain[i].evolution_details
            }        
            evolutionFlow.push([selfSpecies, toSpecies])
        }
    }
    else {
        toSpecies = {
            name: nextEvolutionChain.species.name,
            imageSrc: imageSrcBaseUrl 
                + nextEvolutionChain.species.url.split('/').slice(-2, -1)[0]
                + imageSrcExtension,
            details: nextEvolutionChain.evolution_details
        }
        evolutionFlow.push([selfSpecies, toSpecies])
        
    }

}

const getEvolutionTriggers = (evolutionDetail) => {
    const result = []
    for (const key in evolutionDetail) {
        if (key === 'trigger') {
            continue
        }
        if (evolutionDetail[key] !== null) {
            result.push({
                triggerTypeDescription: EVO_TRIGGER_DESCP_BY_TRIGGER_TYPE[key],
                triggerValue: (() => {
                    const value = evolutionDetail[key]
                    if (key === 'item') {
                        return value.name
                    }
                    else if (key === 'gender') {
                        return value
                    }
                    else if (key === 'held_item') {
                        return value.name
                    }
                    else if (key === 'known_move') {
                        return value.name
                    }
                    else if (key === 'known_move_type') {
                        return value.name
                    }
                    else if (key === 'location') {
                        return value.name
                    }
                    else if (key === 'min_level') {
                        return value
                    }
                    else if (key === 'min_happiness') {
                        return value
                    }
                    else if (key === 'min_affection') {
                        return value
                    }
                    else if (key === 'needs_overworld_rain') {
                        if (value) {
                            return 'yes'
                        }
                        else {
                            return 'no'
                        }
                    }
                    else if (key === 'party_species') {
                        return value.name
                    }
                    else if (key === 'relative_physical_stats') {
                        if (value === 1) {
                            return 'Atk > Def'
                        }
                        else if (value === 0) {
                            return 'Atk = Def'
                        }
                        else if (value === -1) {
                            return 'Atk < Def'
                        }
                    }
                    else if (key === 'time_of_day') {
                        return value || '-'
                    }
                    else if (key === 'trade_species') {
                        return value.name
                    }
                    else if (key === 'turn_upside_down') {
                        if (value) {
                            return 'yes'
                        }
                        else {
                            return 'no'
                        }
                    }
              
                })() 
            })
        }
    }
    return result
}


function findNextEvolutionChain(currentEvolutionChain, nameToMatch, selfName) {
    if (currentEvolutionChain?.species?.name === nameToMatch) {
        if (!selfName) {
            let result = []
            for (let i = 0; i < currentEvolutionChain.evolves_to.length; i++) {
                result.push(currentEvolutionChain.evolves_to[i])
            }
            return result
            // return currentEvolutionChain.evolves_to[0]
        }
        else {
            return currentEvolutionChain.evolves_to
                .find(chain => chain.species.name === selfName)
        }
    }
    else {
        if (!selfName) {   
            if (currentEvolutionChain.evolves_to.length > 0) {
                return findNextEvolutionChain(currentEvolutionChain.evolves_to[0], nameToMatch)
            }
        }
        else {
            return findNextEvolutionChain(currentEvolutionChain.evolves_to[0], nameToMatch, selfName)
        }
        
        // return findNextEvolutionChain(currentEvolutionChain.evolves_to[0], nameToMatch)
    }
}



</script>

<template>
    <template v-if="evolutionFlow.length > 0">
        <div
            v-for="evolution of evolutionFlow"
            class="[&:not(:first-of-type)]:mt-2.5%">
            <!-- evolution species flow -->
            <div
                flex
                justify="between"
                items="center">
                <!-- from -->
                <div
                    w="27.25% sm:20%"
                    flex="~ col">
                    <div
                        w="100%"
                        h="0"
                        pb="100%"
                        relative>
                        <!-- <div
                            absolute
                            w="100%"
                            h="100%"
                            top="0"
                            left="0"
                            bg="#eee"></div> -->
                        <img
                            absolute
                            w="100%"
                            h="100%"
                            top="0"
                            left="0"
                            :src="evolution[0].imageSrc" />
                    </div>
                    <div 
                        text="center 12px sm:16px">
                        {{ evolution[0].name.charAt(0).toUpperCase() + evolution[0].name.slice(1) }}</div>
                </div>
                <!-- arrow -->
                <div class="evolution-arrow"></div>
                <!-- to -->
                <div
                    w="27.25% sm:20%"

                    flex="~ col">
                    <div
                        w="100%"
                        h="0"
                        pb="100%"
                        relative>
                        <!-- <div
                            absolute
                            w="100%"
                            h="100%"
                            top="0"
                            left="0"
                            bg="#eee"></div> -->
                        <img
                            absolute
                            w="100%"
                            h="100%"
                            top="0"
                            left="0" 
                            :src="evolution[1].imageSrc" />
                    </div>
                    <div 
                        text="center 12px sm:16px">
                        {{ evolution[1].name.charAt(0).toUpperCase() + evolution[1].name.slice(1) }}</div>
                </div>
            </div>
            <!-- evolution trigger -->
            <div>
                <div 
                    v-for="evolutionDetail of evolution[1].details "
                    sm:flex="~ nowrap row"
                    flex="~ col"
                    sm:items="center"
                    b="1px solid #eee rd-3px"
                    mt="2.5%">
                    <span 
                        text="center"
                        shrink="0"
                        w="85px"
                        pa="2" 
                        pb="0 sm:2"
                        pr="2 sm:0"
                        whitespace="nowrap">
                        {{ evolutionDetail?.trigger?.name }}
                    </span>
                    <div flex="~ col">
                        <div
                            v-for="evolutionTrigger of getEvolutionTriggers(evolutionDetail) ">
                            <div
                                flex
                                items="center">
                                <span
                                    grow="1"
                                    pa="2"
                                    text="12px #aaa justify"
                                    leading="16px">{{ evolutionTrigger.triggerTypeDescription }}</span>
                                <span 
                                    grow="0"
                                    shrink="0"
                                    w="100px"
                                    pa="2"
                                    text="12px right">{{ evolutionTrigger.triggerValue }} </span>        
                            </div>
                        </div>
                    </div>
                    <!-- <span
                        pa="2"
                        text="12px #aaa justify"
                        leading="16px">Lorem ipsum dolor sit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, laboriosam?</span>
                    <span 
                        pa="2"
                        text="12px">Lorem ipsum dolor sit. </span> -->
                </div>
            </div>
        </div>
    </template>
    <template v-else>
        <p>-</p>
    </template>
</template>

<style scoped>
.evolution-arrow {
    position: relative;
    width: 25px;
    height: 17px;
    background-color: #ddd;
    right: 8px;
}
.evolution-arrow::before {
    content: '';
    width: 0;
    height: 0;
    border: 15px solid transparent;
    border-left-color: #ddd;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: calc(100% - 1px);
}
</style>