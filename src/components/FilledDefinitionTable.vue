<script setup>
// import { useRootStore } from '../store/root'

import { POKEMON_TYPES } from '../modules/constants'

const props = defineProps(['definitionGroupIds'])

// const root = useRootStore()

const pokemonTypesByDamageRelation = (await Promise.all(
    (await Promise.all(
        props.definitionGroupIds
        .map(id => fetch(`https://pokeapi.co/api/v2/type/${id}`))
    ))
    .map(response => response.json())
))
.reduce((acc, value) => {
    const damageRelations = value.damage_relations
    for (const damageRelationKey in damageRelations) {
        acc[damageRelationKey] = acc[damageRelationKey] || []
        for (let i = 0; i < damageRelations[damageRelationKey].length; i++) {
            acc[damageRelationKey].push(damageRelations[damageRelationKey][i])
        }
    }
    return acc
}, {})

// const pokemonTypesByDamageRelation = await new Promise(() => {})

</script>

<template>
    <div 
        flex
        v-for="(pokemonTypes, damageRelation) of pokemonTypesByDamageRelation"
        class="r0">

        <div 
            v-if="pokemonTypes.length > 0"
            bg="#eee"
            p="y-1"
            b="solid 1px #ddd"
            text="11px"
            w="75px"
            flex
            justify="center"
            items="center"
            shrink="0">
            {{ ({
                'double_damage_from': '2x from',
                'double_damage_to': '2x to',
                'half_damage_from': '.5x from',
                'half_damage_to': '.5x to',
                'no_damage_from': 'immune to',
                'no_damage_to': 'ineffective to',
            })[damageRelation]  }}
        </div>
            
        <div 
            flex="~ wrap">
            <span
                v-for="pokemonType of pokemonTypes"
                :style="{
                    backgroundColor: POKEMON_TYPES[pokemonType.name].color
                }" 
                p="y-6px"
                case-upper
                text="center white 10px"
                w="90px"
                flex
                justify="center"
                items="center"
                class="type-palette">
                {{ pokemonType.name  }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.r0:not(:first-child) > div {
    border-top: none;
}
</style>