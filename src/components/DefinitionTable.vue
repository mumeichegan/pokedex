<script setup>
import { pokemonSpecies as pokemonSpeciesContainer } from '../modules/request-containers'

const props = defineProps(['pokemonSpeciesId'])

const pokemonSpeciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${props.pokemonSpeciesId}`
const getPokemonSpeciesPromise = async () => await (await fetch(pokemonSpeciesUrl)).json()
pokemonSpeciesContainer.promise = getPokemonSpeciesPromise()

const pokemonSpecies = await pokemonSpeciesContainer.promise
// const pokemonSpecies = await new Promise(() => {})

const genus = pokemonSpecies.genera
    .find(genera => genera.language.name === 'en')
    .genus

const flavorText = pokemonSpecies.flavor_text_entries
    .find(flavorTextEntry => flavorTextEntry.language.name === 'en')
    ?.flavor_text
    .replaceAll('POKéMON', 'Pokémon')
</script>

<template>
    <div
        flex
        b="1px solid #ddd rd-3px">
        <p
            pa="12px"
            leading="6">{{ flavorText || '-' }}</p>
        <p
            bg="#eee"
            flex
            justify="center"
            p="x-15px"
            ml="auto"
            items="center">{{ genus }}</p>
    </div>
</template>