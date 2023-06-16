<script setup>
import { pokemonSpecies as pokemonSpeciesContainer } from '../modules/request-containers'
const props = defineProps(['label', 'value', 'lookupField', 'valueFontSize'])

let label, value
if (props.value) {
    ({ label, value } = props)
} else {
    label = props.label
    const pokemonSpecies = await pokemonSpeciesContainer.promise
    // const pokemonSpecies = await new Promise(() => {})
    value = pokemonSpecies[props.lookupField]
}

if (props.lookupField === 'gender_rate') {
    value = ((1 - value * .125) * 100).toFixed(1) + '% m, ' + (value * .125 * 100).toFixed(1) + '% f' 
}
else if (props.lookupField === 'capture_rate') {
    value = (45 / 255 * 100).toFixed(2) + '%'
}
else if (props.lookupField === 'hatch_counter') {
    value = 255 * ++value
}

</script>

<template>
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
            :style="{
                width: label === 'Abilities' && 'auto'
            }"
            >{{ label }}:</span>
        <span
            text="#000 14px"
            :style="{ 
                fontSize: props.valueFontSize || '',
                marginLeft: label === 'Abilities' && '.5em'
            }"
            sm:ml="unset"
            ml="auto"
            truncate
            >{{ value }}</span>
    </div>
</template>