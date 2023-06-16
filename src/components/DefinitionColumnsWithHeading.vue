<script setup>
import { POKEMON_TYPES } from '../modules/constants';
import {
    move as moveContainer
} from '../modules/request-containers'

// import { useRootStore } from '../store/root';

// const root = useRootStore()

const props = defineProps(['moveUrl'])

const getMovePromise = async () => await ((await fetch(props.moveUrl)).json())
moveContainer.promise = getMovePromise()

const moveDetails = await moveContainer.promise

</script>

<template>
    <!-- move type and effect text -->
    <div
        flex="~ sm:row col"
        m="x-2">
        <!-- move type -->
        <span 
            shrink="0"
            flex
            self="sm:unset end"
            items="center"
            pr="sm:2"
            >
            <span
                class="type-palette"
                w="90px"
                text="center 10px white"
                :style="{
                    backgroundColor: POKEMON_TYPES[moveDetails.type.name].color
                }"
                case-upper
                p="y-6px"
                b="rd-2px">
                {{ moveDetails.type.name }}
            </span>
        </span>
        <!-- effect text -->
        <span 
            grow="1"
            p="y-2 sm:x-2"
            text="12px #333 justify"
            leading="16px">
            {{ moveDetails.effect_entries[0].effect }}
        </span>
    </div>
    <!-- move main stats -->
    <div
        flex
        justify="between"
        items="center"
        p="x-2 y-1">
        <div basis="33.33%" text="13px #aaa">PP</div>
        <div basis="33.33%" text="center 13px #aaa">Power</div>
        <div basis="33.33%" text="right 13px #aaa">Accuracy</div>
    </div>
    <div
        flex
        justify="between"
        items="center"
        p="x-2 y-1">
        <div basis="33.33%" text="12px">{{ moveDetails.pp }}</div>
        <div basis="33.33%" text="center 12px">{{ moveDetails.power || '-' }}</div>
        <div basis="33.33%" text="right 12px">{{ moveDetails.accuracy || '-' }}</div>
    </div>
</template>