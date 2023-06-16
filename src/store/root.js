import { defineStore } from "pinia";
import '../modules/push-sorted'
import { SPRITES_URL } from "../modules/constants";

let fetch_

// const pokemonTypes = {
//     'normal': { color: '#A8A878' },
//     'fighting': { color: '#C03028' },
//     'flying': { color: '#CDC0F5' },
//     'poison': { color: '#A040A0' },
//     'ground': { color: '#E0C068' },
//     'rock': { color: '#B8A038' },
//     'bug': { color: '#A8B820' },
//     'ghost': { color: '#705898' },
//     'steel': { color: '#B8B8D0' },
//     'fire': { color: '#F08030' },
//     'water': { color: '#6890F0' },
//     'grass': { color: '#78C850' },
//     'electric': { color: '#F8D030' },
//     'psychic': { color: '#F85888' },
//     'ice': { color: '#98D8D8' },
//     'dragon': { color: '#7038F8' },
//     'dark': { color: '#705848' },
//     'fairy': { color: '#FFAEC9' },
//     'unknown': { color: '#000000' },
//     'shadow': { color: '#6c5e70' },
// }

// const pokemonStatsNaming = {
//     'hp': 'HP',
//     'attack': 'Attack',
//     'defense': 'Defense',
//     'special-attack': 'Sp. Atk',
//     'special-defense': 'Sp. Def',
//     'speed': 'Speed'
// }

// const evolutionTriggerDescriptionByTriggerType = {
//     'gender': 'The id of the gender of the evolving Pokémon species must be in order to evolve into this Pokémon species.',
//     'held_item': 'The item the evolving Pokémon species must be holding during the evolution trigger event to evolve into this Pokémon species.',
//     'item': 'The item required to cause evolution this into Pokémon species.',
//     'known_move': 'The move that must be known by the evolving Pokémon species during the evolution trigger event in order to evolve into this Pokémon species.',
//     'known_move_type': 'The evolving Pokémon species must know a move with this type during the evolution trigger event in order to evolve into this Pokémon species.',
//     'location': 'The location the evolution must be triggered at.',
//     'min_affection': 'The minimum required level of affection the evolving Pokémon species to evolve into this Pokémon species.    ',
//     'min_beauty': 'The minimum required level of beauty the evolving Pokémon species to evolve into this Pokémon species.',
//     'min_happiness': 'The minimum required level of happiness the evolving Pokémon species to evolve into this Pokémon species.',
//     'min_level': 'The minimum required level of the evolving Pokémon species to evolve into this Pokémon species.',
//     'needs_overworld_rain': 'Whether or not it must be raining in the overworld to cause evolution this Pokémon species.',
//     'party_species': 'The Pokémon species that must be in the players party in order for the evolving Pokémon species to evolve into this Pokémon species.',
//     'party_type': 'The player must have a Pokémon of this type in their party during the evolution trigger event in order for the evolving Pokémon species to evolve into this Pokémon species.',
//     'relative_physical_stats': 'The required relation between the Pokémon\'s Attack and Defense stats. 1 means Attack > Defense. 0 means Attack = Defense. -1 means Attack < Defense.',
//     'time_of_day': 'The required time of day. Day or night.',
//     'trade_species': 'Pokémon species for which this one must be traded.',
//     'turn_upside_down': 'Whether or not the 3DS needs to be turned upside-down as this Pokémon levels up.'
// }

export const useRootStore = defineStore('root', {
    state: () => ({
        pageLimit: 65,
        pageInitialLimit: 28,
        pageRequestedCount: 0,
        pageRequestedCountHistory: {},

        pokemons: [],
        pokemonSpecies: [],

        hasFetchedAllPokemons: false

        // pokemonTypes,
        // pokemonStatsNaming,
        // evolutionTriggerDescriptionByTriggerType,

        
    }),
    getters: {
        pageOffset(state) {
            if (state.pageRequestedCount === 1) {
                return state.pageInitialLimit
            }
            else if (state.pageRequestedCount > 1) {
                return state.pageLimit * (state.pageRequestedCount - 1) + state.pageInitialLimit
            }
            else if (state.pageRequestedCount === 0) {
                return 0
            }
            
            // return state.pageLimit * state.pageRequestedCount
            
        },
        isReady(state) {
            return state.pokemons.length > 0
        },
        getPokemonById(state) {
            const pokemons = state.pokemons
            return pokemonId => pokemons
            .filter(pokemon => pokemon.id === pokemonId)
        }
    },
    actions: {
        async init() {
            if (import.meta.env.SSR) {
                ({ default: fetch_ } = await import('cross-fetch'))
            }
            else {
                fetch_ = fetch
            }

            if (this.isReady) {
                return
            }
            // init state
            
            await this.addPokemons()
        },
        async addPokemons() {

            // this.addPokemons.isDone = this.addPokemons.isDone || false
            // if (this.addPokemons.isDone) {
            //     return
            // }
            if (this.hasFetchedAllPokemons) {
                return
            }

            const url = 'https://pokeapi.co/api/v2/pokemon'
            // const query = `limit=${this.pageLimit}&offset=${this.pageOffset}`
            const query = `limit=${this.pageRequestedCount === 0 ? this.pageInitialLimit : this.pageLimit}&offset=${this.pageOffset}`

            if (import.meta.env.SSR) {
                const { results: pokemons } = await (await fetch_(`${url}?${query}`)).json()
                this.pageRequestedCount++

                const pokemonsWithData = (await Promise.all(
                    (await Promise.all(pokemons.map(pokemon => fetch_(pokemon.url))))
                        .map(response => response.json())
                ))
                    .map(json => makePokemonJsonLighter(json, imageDataUriByPokemonIndex))

                this.pokemons = this.pokemons
                    .concat(
                        pokemonsWithData
                            .filter(pokemonWithData => 
                                pokemonWithData.sprites.front_default != null
                            )
                    )
            }
            else {
                if (this.pageRequestedCountHistory[this.pageRequestedCount]) {
                    return
                }
                this.pageRequestedCountHistory[this.pageRequestedCount] = true

                const { 
                    results: pokemons,
                    next
                } = await (await fetch_(`${url}?${query}`)).json()

                if (!next) {
                    this.pageRequestedCount++
                    // this.addPokemons.isDone = true
                    this.hasFetchedAllPokemons = true
                    return
                }

                this.pageRequestedCount++

                for (let i = 0; i < pokemons.length; i++) {
                    const url = pokemons[i].url
                    fetch_(url)
                    .then(response => response.json())
                    .then(json => {

                        // this.pokemons.pushSorted(json, (a, b) => a.order - b.order)
                        if (json.sprites.front_default != null) {
                            this.pokemons.pushSorted(
                                makePokemonJsonLighter(json, imageDataUriByPokemonIndex), 
                                (a, b) => a.id - b.id
                            )
                        }
                        
                             
                    })
                }
            }
            
        }
    }
})

function makePokemonJsonLighter(json, imageDataUriByPokemonIndex) {
    return {
        abilities: json.abilities.map(ability => ({
            ability: { name: ability.ability.name }
        })),
        height: json.height,
        id: json.id,
        moves: json.moves.map(move => ({
            move: move.move
        })),
        name: json.name,
        species: json.species,
        sprites: {
            // front_default: json.sprites.front_default
            front_default: json.sprites.front_default != null
                ? (json.id < imageDataUriByPokemonIndex.length + 1)
                    ? substituteImageUrlForImageDataUri(json.id, imageDataUriByPokemonIndex)
                    : SPRITES_URL + json.id
                : null
        },
        stats: json.stats.map(stat => ({
            base_stat: stat.base_stat,
            stat: {
                name: stat.stat.name
            }
        })),
        types: json.types.map(type => ({
            type: type.type
        })),
        weight: json.weight
    }
}

const imageDataUriByPokemonIndex = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAA5lJRi1bQQEBCD7sUYSkpzrDG9/3Mxc3Ok1UGsADFSYin////Nzc3/amLuIDmC8aWUAAAAAXRSTlMAQObYZgAAAZlJREFUWMPt0rFr20AUx3EVoxLo9JN04KGLrhkyyhxtZ4tX6OiLHU/ZCgpFcxEerzSQoaWbQfQ/EIZugdCxGLJkyOAx/4Ihe4Y8mez3PGQJ953fR7p3XBQKhUKhF9abfeevjHz4dVX/u6ouC/H8WdMs2q9ycNZwVVsLQDzpf9A03z5UCxHIPk0uuPPZu6Zp/3wRALogKvWMdqAq/CAjQqap7MFSsPWQaIys1Dr/2AP/mX4QAbQDi3ZZy0BGJRi0bVV7lziYHRIv/fnuGGm7FID4vqRxdvh7tUE6r4QAPVjvwKUX/HrICDR+6G6glAT8XCW8Q77a3mCIeV15b+l7l2it8257C0DN/WCqn4Lthf9p2Pc6OeL5cwOHE0z9r/ttp/XR1FwDFidWRd7ssOtzUICymHjBYDT8u906pCPAgYFAgDMjOAWF1A/i1HBsbMpLCMArnVtAaaiRBHBO86hN8j0AUmPRA4VCABKdp1HCYOCck4CDnAGrIt5sNpGg01NbRMcJn8aYQgIGxkTxev0/2qv+46FQKBQKPWOPUaV+iytbwawAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAAAglINazb0xe1IQEBAQSjnVQVoQQUp71XP/e3uD5tV7MSlirFr/rKT///+TpY2AAAAAAXRSTlMAQObYZgAAAtJJREFUWMNiGAWjYBSMggECG0hUD6Bsjk0ABGIwCnc2t5Ste0ia4DZy8BOyg4UEjsM1Dq7ILqITJP37eIVLinSjJwPK6KYjA6ZaQ2KxuNoOiYPDXRj1ig/cYRvOFJAWB819QnbQGgXqAO4EAD5Qo6DQD5iIQ/3LGBmjRgxDQdRFfKKxwIWLBXuXlAZ5jCGudZG1YYqtc45UuYBZcKFD5ctJqcV5xRTivy+Gz49gxmc4F9hblP20MhjnAuo7imJaN6fxP0KpO4Xq4eBw43guvL1L1ILEVc8Qvv8E8tUXdTI8jGlz/BVKltapz3eOknDFwRBHE76GNs56aM0ZZYxx17IBHqg8XAgkZnsTdMl1iG6OMXVwQMob0aJ5ErtckaMj4rEeTPO+QufIWYl8CZ/GSUvaPCrSN41Ua9IlK7Sgr7pju7egxbbtWrUMLy7xQzkZrDQMBGF4hYjnWQILve1PIdhrFD30kE1HKl59Bc/SlOCCh9yEPoFHwSAIeY0+SUHoa7jjCvWSLf4Ekhy+/Wfmn705LZ8/fNky+6uWQyvz+TzM+vZlPO2yHj79rO9NDSsDvt/ebzZcJfavnvREwwBYtyjF4vI6hJCQG95JC5C7mzKEseUsfYvuBhsMehQcgMvFBasjmgw0+zFg5xYXuaOVSuoMg5wPWNM0+bIhMseAWU8QUZDxRMUxADYCNgJAuiY/g9UWRkcLvwbSFk/PACZFt44A4ShQAxjax73UFAFbpVo4D4DtD4AGfBrYyZkPj7sINKSLJJBpiF7ffucqOfhWJbS0iEwsaGqIfK7GdSLjsS1zExuYyjsF6KLw3hN1XsqB1UsBq3EDuQYUZOTRIF258FWlFoPyhuIaOQNC5RrfjQNrGQ0L4VfqLLSDKvvq2nGDnSdqVcbM8lsDU6UqTsTGezJ/6hMgrYyXh2XuyOqV+oey7/nVobuGoH0Mo2AUjIJRQDEAADnaDiOOwW7GAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAAgtJwQUkH/e3MQe2oQEBBanDla1cXeQUGD3nuDMQD/vb29ajH/////7lLevSmpcaUrAAAAAXRSTlMAQObYZgAABU9JREFUWMPskrFr20AUxk3ApXjM0rU9GoGzHgZhz9lF2guOCC2Y+sDZEij+A0TgsDsZbLjNYATmKrIEg+ltgSxGOH9FllK0ZfHifk8yJY7seOqWT7Ik677ffe89u/CqV/0vlczw37Mxu/3mp63CNiwAM5zvQuCpWc6HpUVpQX7I7PADcDuL++X9crZQrruDKGHdddXdMtWjCuwNR952YITloDudf13S8UUpO+X2pro9oGqg2nT+8EhHYkgIGb4wIWtdY6I/18l1Ej2orqU5jYbbJwSAK/UjSZJ5Mn9ASRyqmu0d00zdjrlOSKIecJK1m4kRLdN+I3yS5LfhFfEpBTYTJcVrGCLsJDNL7xORAeg7DwQ1OxGGZ4VVxqsHkd6CSh4Yq+7EM7R6A59v1KoloejHdL0NgPJKaMMSIIwBQcqIQHn5FtRVYeymABcGCkGn8lRtisVnKnbUFaAAAK/4xvhG1FdApdCdjnNAwVceADfd0hfhXWg8RAB3ORY6G4GxCoKAB5ViGJ3FvgkzgFN0J990sQ7AdXF6RRPFcWzCt9QQvfOoojwBQFGGVwzjKJ7NUsB1A2u9YhaQHxSEeRR9fzaLQlEYWxsEytoJVl8ETIyIONxDU3hhf20G0EUnBdgB3BBzUCMBnihsIY7rqq5O5LezGVq4lewQOAhvi3+POfUOAcyPTBQxR54DGF8JtsXvSNlExjGT7JbFjDXShIMTKRnb5BeygU2FkI5sOA0mG1KeC3GCtwxIHsC+cDISECelIYYbLvmQgwHLPA06GXmdBn1ZJWj9fr0gLXW2Ja5lgpwVQGLwN9dnW5ZaQlnAAKTuMdlEiszU0lqLpwEDJGjpUPEUQIbPDPUjxSH/oNFaK+oN7QADVUQBPUfr43a7/f20N2gOpIbEWtvlgW7137UvP9KkejD0HNZuX+wfnepyv6xxfVaRbg10/0O7fVnWsuy0QAC/2D88OhJk7+seMrynf6K/7ZUxa9tAFMeDIR/giQuaAtWh4CaQpXsHmROaBIrQkWTwGvAoY/OmLplKR4MNt5ZO6Tfot2hr08nfpf93clX7TCGZm7+FjE/vd///e4ewmzj7GDNjJ/SPhhri6O2n3JiRqx1MtFseHvPl8uQOFg8Pq5VDoouM2quPAuS2EZNGV+H7Nrh7x6zdauKANERkngCILl2tDUYUKM0feepQjVQeUOZLB4xsg1tYPzD5EMBEkMUyI0+YxvQKLVIzwpQunPOJAHiioX8BA2WGmNK97H/ftSBETjuCwkwJjVpGJEx8kS8z1RJ5lxuiFPUJ0SEwIIpmPANQuwWCFEydzvAAHYvbm0MDGkbcFpfLyNUmA9DqhHYWDQAoACKOh1TMb8kisGLWnHUAXEwSApKIzz9jY2bUA5g+bT1gctxqgrIAGPL51yQGQCTA1TcPKADeheJkH0g88LMHaPrh/S8BUgDSeYTPEdBup6hvPZAW2xntATGaDIZ0y0xxDyBLRn6iN6QkU3YADPD7jDvRnqIUgOx+Ew5JtbA4BlBv8ZXI8ZnoAJCgDfeJIGTQUi/iOakgkmhc/DVQah1dT//U81yRqgIgorOk6AOVI50Wae6dGECZlT+CKaG1eo28/iKN+CavYdXGHvheboNzkEHVmuCNcm1EFdYVoS+ejzfW7mfKUA5dGC1oV55bn1UMivnAHr4Na4U0mINtRnq3va06axYg/Je7BtAN7tQ23e6yYw9wCFhbbrMyw7IgUNV7xwzNT45UbvJyEy4KMEQgnh0/sJVcoaQ7nq25xESfqWtUbwsc2nNlG7QnI3iBTseS9UVEdfKqV/0f+g1lHrVonPr2jAAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAAD/lEHeUjkQEBCLKQD/1XvmrFrmOQD/1Qj/xWL2pAD///8IOYsYi7QxrO6akEbfAAAAAXRSTlMAQObYZgAAAa5JREFUWMPt1TFLw0AUwPGHDTi/xEV0ybtQcIs56SJCG04dnBTibqs3d0vxCzS4iZObW6Wb2C+gc3HwA/hZvGvS1XtxErn/0Hboj7uXcAn4fD6f72+2kah2/48RW4k9NKUtFni8/w2I+CDeRgxbAUSMMeTv6d2CJfHBpwG7y5wPXgzYOWoB9i34WIMxuAreDNj6ogZM3GB1G6gNsBc1acDmMzgbIGKSC/NLGVA9OYFEVIckQClhV5i6dtQHKcucEoVowfTOATqJyhJFWYwYmjnKsho7QIxiP5RESCQBytlk9jPICElIstm5J9Nq6lghoyZhL+xtZYBTJF1NpFKwYF7NwCkSrYdxVN+42bwEp8iL4nJ95MrTMTg7KYpifeSCU3B3bAE24IENohpE4Cy4MeCqAQMOKEznNVAo3EBZcGGHCBTncROEdktDRKEGiF0GwG5R6NhMTYTdEeepcaK1BWFGpFMOiGpAGekRcEDY0zrHkHp6lDJAB0n0dE5Eves+cMqIhDwwH6oPTGDPTk4CeHXqwzlALjg8Iztqzn6ndKRcfS0Wr9AqKVPw+Xy+/9g3b5hePLCpqh4AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAADNOTn/UkoQEBD/QQCUIBDmzay0i1r/3in/pAD/////g2q0tLTNrHtqamoAWv+qldGIAAAAAXRSTlMAQObYZgAAAqpJREFUWMPtlb+LE0EUx0c2AVO+DOFARZgXtrpm1+FO2ORkixUuXX4SMIJwRToLCce2Fik23RUrxNJLFw7BaJdKgo2IYKOVxXHd/QlWvt2EO6PO7ixYWOwXkt3i+9n3vjO7b1iuXLly/RPdaGb03zYz+hdc313sQRmFpe8fIKnCtBX7gesXWOAC0dTvqI27aJZRH2jhQDxuYycDUOvMT7GqnwFN+eM0Q4gy4hM72gf9RYoF28Bz9S6Y+Ld9mKpXtYok+3egpAZQdKQE0M5sQAUAtgA3mZA2kDjTlyHln0Apmfk18wkreG7pJAXYyuB5XsNlSYwBUOmxjQouAWR+mRQbRRua18/30hZ2/+j6Gy2RP3QLXsFV+m3+dUiAaK6B0Au8SGo/8OEQzRZU1kR4OE7yF1sAB8PhEXKAdVONIPQaYyXQFiD3Y0BC3FQpmISNwHOVnxtyRsBTutj0Y+xmMA6m6gIDRMsYkgRYBgorAibTIFSv6O5yDQABCyQgCKbeRFlgD+Ati4EvwI0l8giYJAB1uDujCJThGfDaUhAwnY67ygjGx1eXVwDU3kCHMhy+6I5dFTC3nVUMfPMBOMAqejUedkMlsLLr1hXgnN86o9Rhr6t++R58lizeBj8CXvM5AUXznasE6isyHFCBCKjPeJ2AtqkuQD2Rof+d/H5Z8NXlhcV6mHicWjQq+z7pGBFsZ0Z+0Uw7sMwIaCMKcPbIX0n53LAcAwMCeJX+dpopgEDoU0fLBQGIAMepkxKAR0BUge53UmesTS7pjxBNQbf+SGMYA2dSEgD3fX9kpZ9A8dQzytgiQMPP7gkqselMavglIkBnE15n1M8cgOjBBgo9QM7PZbxYqFeBCBlf3t+BTx2mL+Ps0Ye5IrIqy4WTBWCWIw2WSQbLlSvXf6CflqK3bONLXs8AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAADugynNUkEIQVIAAACDMRju3nsgc5TutFrmQRD/1RD////2pBDNzc1iYmKaYTFhAAAAAXRSTlMAQObYZgAABH5JREFUWMPt1EGL00AUB/BB00MvwsRGPG6eiQgiqFG8ptNRlEVIYwfUmx76BVbwLKjkuAcvWfwCW/YkehK92/N6Ev0C4nfw/17ajU3T2t48+GC3pH2/vPcmM1H/4x+N/S3zu/vd7Ui3LMvtSmwNul/KLcc4KLcT3beH033uym2U7jD1ZPIFoFNkG+RzVnc6ORRAG4AcoDyY8NxeGOyojnPr6wwD1T04mJQ8d1/7bqh1sFq4rKMBptOj8i2A0VX4OyvykT3UsepOMMKUe+Jk53LtU3v+UCNk5qNyUioGdpAkSa51q0C+AHUwnUwA8E0P6c+f710/X+y0NdSzRkAX4EjAgPNZFK9aCpzF7QwAL+vR4X4Fbj0XEfrLK6QTxA0dA7ydHCF/BiSu+8sNoQCiHyjeG4dNoLMmCJM5gHj8SKl6BulppwkuVOBGIJnB5kBn0mDWANeCBsgBJK5VIJY2AWbLtDR1ntSALyljthp0KEluPhAQVCDOVMdPTkCisyWQR4KC6hrCSJsCkgRTN0YQgN1DqXwBka8GHndEUXJTR3CzEhElNUCrC+ACgzQZ6gE+rWyViDuSIQRg6mWADXsaP1HGX/W5QA0wdQMYuj3El/iJ+CH00d3erCf5pLQxg3G+1qk6ndywt/kp+9h5M3DVS1A4XXxuN0KtdU+p07aPk4ShsWZ7ewL2lBq0AM0g9Sx/+lbALVTD/6tooQGw9/qaY2RRSAQlXOE62QEASjRBpCUCIl0Jk/C9O4RKWQvAolRBhBLSXYJQyhAN4nZw6UUQ/gF4p3LzhMjw2QCe9gv/K7dCI1OZnh0ohAGIW0BOOvrIwCnvtoih7mWqLjFotGRi/ewdT40XfJwTpFwgcoAIgJRaLBG70B/h9OcxEYCEy2Tf8mkaRM0zGnLbFDuiGuhgJIBSZXaaLzJE9EZuX68UOktnPZl0+dXt3ysNQH6S7/pzEKtTahnYsjQRgczvHndySmc9ecsd9dQ9gDye52OxMm8OsqUCQxQHSE/l4Xj8pKpAsUdRBaIG6Pv6MsCbPFX98bgWZg7iBvA02dR7tBtk3sWxiBpgaB+gKaxy8QfXU965sYSUuD1koMMQUzcFH0o+0wbJ8xIjfjYdVPLbQJ6TtRmPcFLC4I/4pLRWsNUWuDOuS5i4r4nL6DaAFXSUYoQa9I5DnxvVrS1hmyorM9c9xTowkeRfagGj3QxPcAHoPB4dI18eXIvANtAC6nX6GljOp5eqPYbar0EIYSknko7aI9TB6wWgyTAoVoBTOGPFHDyd7XEugI5WAf1wXuJVBSKisEjXgUJqFMUJOF+gwKqZuScJgFAA3S2KdB3wkSDx8gRYtQ5QNAc0A6vzVY58ortzELInq9YA4oggBEDIDl4dHQHxSIQzVPm/ggwHtnjlig3A7C2HcA/Rk/k78GjedMc55wnoqXVhGCxcheG6qc8cf80pWijo++vAz18/vi8AFKB1wH7aPbbp4kiX1wHPevbPS3Ml/3b5vdo87Mf3Hz8fqy1iN73/3m4DvNRL1f/4B+M333e4bpVR8Y8AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAABanKSLxc0QEBApc4PmrFrNeyn/5pz/1WqDKQC05u7Vzc29agBiKQD////VlFKviuZEAAAAAXRSTlMAQObYZgAAAbFJREFUWMPtkzFLw0AYhi3JD+h3CYWOdy0FHaTtVaGo0KRZqiAUe9Xd9tpBV9M/0JjVMWvHbEU3Cw4dJeDuJPhD/LK49ssiDvdsgfchb3Lv7RkMBoPhnwIQFMunqShilDAvRI8unKcrFOrkvH2ALyjyChvDvIjgYZgBEy5VGKDAT9bcoQqXTIiafAGyMMiF7jdd6GOlwwKCnaKw3/0iC9aKYScO9EodgYAHzVJAOYpy2WrzIBg8QY+R/qzvSqerdQIOE16TsFRs06omCbgdUUeBNKSaB+AcrwV3iEvirpRHyhdAEmwAmMaxGjEO2IhAAJV5HOkJ1vrAJ8JVlZUHPY0jD06zvUBwwlnMFtfhIrqSm8zGM3cJQoiCUp+bzMvvNlGYo7AFVvf57k/Xj7MwitX75gzArxOE2VgrHS/v3jJwmQCCEM7C5Xx5/7oFh7Ly0jz/hvHQvSAKrBHf4F9iwn0GaO1uVBINpZUa4qbyEUrKwDUaIxRamCcNvKqUnqDQl5T5WYxDotQto80baWHzREoPqAImZe5RBZv7Tl7dAiDeIGlhDgXe7v8KZNFgMBgMf8IPxqZrM0ALGS8AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAACLrPZie8UQEBDV7va9xebexYspQWr///+si2Ksxf9qShiUYmIxQUqLWiA9lQ09AAAAAXRSTlMAQObYZgAAAxdJREFUWMPt1L9rGmEYB/ATB9e8ekekU3yNXMbTV2Ol6WDySlz98WIgnQ+kUPxROQldTDzyQseA4RAKIZtr6FCaThk6NFvmrC39L/q856EZvPfOqYvfSeH58D7Pc7yvsskmm2zyIpGtNUHyQlkG7YQAtrGs55chQGYBIlxrBINhvbGwI7YWgAOYEVgfGy3A3ogllGBgM2+IGNdoxVgH2GowgAwBxKw+UYYjSlk4UOwihIkADSUM0KEexEmNVsKBMyQSb6qUGiG2dNma3awFbA8gplIWBrCzBagklBAZdGfITYYxb2aEtmRHpNA8GvM6iqh8JBExfb6k7jZrKW5UzvmhP4hmugJYrbjVmR9QBXAuA0WEUtuEYdyfA85RkkvuauECQI/YPTxwZ0jyUbXMO/7gdREmiH9+AVR+LgU/EeSNjXV2Nwd7nEtAFL8T4PEc6+SAuOAj59TwB6n5WnGuj/VPhgADSo8kW9JRSiw23culkP6gRE74MasUFcmWRLluDfs5OMeyLM4rFqH+M8SsIlRhrJcAgLzkYzpoAvAr76I0wRiniZMT0yRbADLUD1iiHVwihLwtOTkMIo4tSncP8c7qgbm7n9L0+fnJca7gIBtnGpSqu/zYZ2CtBd1M2j+e9k0B9BbO5Gm5zvm447NTAUzzfck029CT3sNpSsuH1RH3AbjngrYJca6K8CcP4LhZ58bqlup4CdrOtE8OAGjUGo5XgygRWYLTx0cAKq1y2wMrlQdMAX7BzE0AR4oETExzIsD0O7sXgJar44YMOBMBHOfblN3f56kGRP4G7rcdiCBfTx9ER2oQgCHcoa1+4Y5qzYoK90GWkgeuEUrcIUZrTfkBsVsPiEczX2FMCzjg7Ha+Jkc8y2nGaowZcnADPcGmrmcuqGmMyB/82U0CWvrw1wU4q8EjHgTipd+m8+WPCwqsYQQBhNMl+BDXr2Zwm9KtjiJPFKrgSoPIIgGgPiA5DEAhpNBwqRIKGO4LksPeT3lL+qIqGgpkX/SRCwNIN4H6S5BKKIHCIMZiY9ltoqwTEiXKJpts8j/zD+mjFtiUIQ1wAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAABai80QEBAIOWIgYqzVrEr///9aORjNzdVKSkr21ZyUrOaUlJSLYkHmxXMGBs03AAAAAXRSTlMAQObYZgAAA/RJREFUWMPtlrGPEkEUhzdoYiwHaIyNvD0OzkDBzprcqYXLjjZ2momRRAtNRkgsDAnZ6grR4FxigWtUNjkb1MLtiHZUconRZCsNoaK00MK/wTfLYiHHiJUNX0Pzvvzee/MCGGvWrPlv0OTz6IWVyoOnhBqMMePIuXer1B+XD0jGJoQw+2R6FaEo206FKCqDFQXJiCJLyJNTf69PRVJiQMyJXMHzvHt/E6IHTiKkc5t1bzrxjBTAPY0wIsiQZJx0rirqu9OpV57wa0sjSlEO608OiK0yhLgznX6ZtjhfHrGfw3EdkpYODr4pBCZM+A1NhD/K4ErJRfkQI6yPGFFu8WYLI5bxlDJmu2VxXwkghIcTQEETcaTNmLtdFiQWNsWjMm8CBM8OjQh84wh9xMgcQKGxO9kKSp1GcFj/mw+pnSMJFZIF+CjqL5vBqCOEWDRSvbbtVskcm7hQwsKGv48fSHdBkAfM/i1kQlbFAGSvVBSi7vcaCxFAmc02iKmegJ4NX1uljlD4PSHaAAtCqk0txsBkWH8mDMM+fIqe0h1sqijrPsDz7kJL1KLMZLhWVR9e2YoObJK9JAQePcDWgmAUUaCWBWarpgQoRRW8w/fYk5Q+BItCylRCniM/sKP8/gHe4XB4SdySchQEOMPi1Ca1gCt+foPrEQrDIUbcLcnHfq9tLAIo0EJsNPPXo0oi1P2SlHunDj1vk5rKUAf6NjKpg8JgW75oAmD9oQYAdgXQ4rW+ifu9PBwSFDyvaSwF8lwR9tXI74cDvaCIhVqYiydwCAqgFwpxfWjazkwo7jW1wrGaN8b6V87J9zhBlmTknlfQCSkeTjzPq5ChmiBDqp9eeE0AncBDDEgmyJDznwvon9IIY3UaPdxRLKQ/74+UoN9S7a38QCsnB1nibvnRKkJf7ojbBBuynn2PZEEvlDm/2YeeuM1IxuR8jD8aegG4Gvv53Z2OU+X8K5hSFnTvlrLG6uF6sCPg9JureLJUL8zO9QeEb9tnw1c2Qbbbuo5sN+8pI+yfDqcbjhIyUvdujFncG3OcfLJ7hZGYbXN5xBHG3Dy/gavf5XwuWJQuNWymIhI2EoFSai0TNjCB5v8Q0nqBWknEFXsuaFtyqUVhLjiJYC3fEvZrUgpq6i8um0Vk4JROADUjTPEnt8pmEa72lIDGQHn6hW3EEVmtYNIYS31HsaqtDGZrhOBgJpzvxitzGaITjkfRTIi6yZ1gvetq/9BYn9QEkByWMuyqduaifAAwf0ZlmAwFDcXkmBNBoRdSYPwhuOdx6JVAgTJGqzJYVUi5wqZiR7aNVdkUtzuijqe0KkXhS9HoGitzPDCg0zb+DWxozZo1S/gFg/6h8YwDB/YAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAAxrEHmzZQAAABq1TH27osYWkFSYkoge0p7OUr/QUF7g0qs9kFKxSn/tDn/e0Fhg1sXAAAAAXRSTlMAQObYZgAAAaxJREFUWMPt0jFLHEEYxvEXDtwLV727MlyRIvcelz3YZt3hwoVUIYNVtjkZrjgCOSNiEzCKMZDGTURSWoTAWqRJ5RYaLhwJpIzllgZs/AA2Xm2lp/gBnkar+RdTPT8YmCGXy+Vyue6mfPf2BHvw/ex6f74Pg4PJ7szyweQHDIrLb0v5pIAB7R1e5IdF8eQ1Cip7RVHsa1MntKc3e2O2CGvmxfU+PT0+QcG//Ksx/+0rBYKlMn9Ypr31FscYePuyLE3aX+/AgPnYpAs6QUG1PKqbNNIjFGyXR2bb+NJQBAK1ktZTZg5AsDP7PFM8rQt+jooxQ5UxBzwFtZ+A6C7zmy4Hw9l5onFEQFr/0XqO7TzV7ADYeyORSGe+WSDP9gGwMRCRNvumSV4rREDUk+gjs8TkySoAksj2xiEzo6DybNy3zZuH80JC6gx+SzMLYqLaKgQ8a3USJFPwCQMbYyvCjUdU5S3sSiORzXf+3E7mYyCJJGz1gy/+sA1+P/33l20uDhuP6wQKa3WXla9iAuuIfGDFbUKrrIXCSmKC89ZEFj8T4VU336+Qy+Vyue6nK04Da/AjUCEwAAAAAElFTkSuQmCC',

    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAG1BMVEUAAABqi1qDxUo5SkEAAABKalJqpEq05lL///8zLKwdAAAAAXRSTlMAQObYZgAAASZJREFUWMPt0DtygzAUhWFmwAu45pGaQ8Ct5TikxUZOHeTRkDZmzAJIwQKSwsuORLyAqy6T0V/zzbko8Pl8Pt+fbfXmCPpPx4HZEfQztk4DDxMaJ7CBG1BwAyuYHl0GXIG2IOffFG4UkJMDmNeAQswGL3OOYu3wE/2UQ3wf2SDM8zOVN/nVcMGkqx3eb9ctE+xmVBrluU74oChhqngTISYMUFUGDCwRXgCF4oPogoEDosyCkkwZCwS1VkAlrGhY4ISyrsgC5jNFQEcpd8B2xHUZ2AfMTunzgUwxF7yO6Z5cTorGUSwg4YN4AbFkigPdAUkuIPELOtmwbroDobsu4d9klWaC0H5skKaO+bStiOlJ6FTLgJlszfdatgG7SJoCn8/n8/2TfgBq5zf/BOpapQAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAADu7v8xMVIAAABaSnO9veaDg71zYqxqvc1Se8XeMTFiMTn/nLScnLTmYoOvqF3SAAAAAXRSTlMAQObYZgAAAwJJREFUWMPtlb9u01AUxq2aFzipE2afOGnLZMVOEUzYubdlQmrq04XJqRtWqCpZFVtZ0pUsZIUByekEEkh5BJSJvU8A4hk413Yrht44SEgs/pQ/tnV+Od93z9WNUatWrVr/QKb7t8DAMLw1yjyRlldtw/DLp2Lg6up7CJC+zK97rnop7cOorSE8dGKA+zlhlgDXA2D7boAbJHBDuEXwe8Cy0L3TETp7ECjiD0DdtwIdELcCC1hP1J1ijA1gSY0nE7l53sK6BWx1B8lIC0DQ6PKnmwNm0SCwDhp6wEJkYrMIoSKPkJuuABqIaHOKArDVfRdWA3YDbwB2hCw9ECuA37byZDKgLlcB3QIABCsHuLp4oh1cDK3cF4BbAByHl62JrmZrJAGoyC2bQzAAjRjUg0QH2NASYe6JQ7SxDcPcUdLQbT7OUMamTTwe+7JDzArQAaYDJdHs4Jfj8e6ZpKEQPDwdgHFJED6YJ+Pd9JS6B1Aukt4TE53nP3+Mx3tpikS8BnrAETnQxMWSgRdiv0N0oHXEnngFhWSAFsuP4/HrX/NTBqxQDyhLLcFaZF/T9Nky+0SUBA12tHKZgGgxT9P0apm9F4IgZEAXIi4B//xyP736ln0gIlCOtMvERJMtPXw6uThbZDnQWgGYyMV7QHQYTi6dx1n2mTOE7ioAWAp4hTNnkM19zoAMVIRoRtIXDSE8v080LBzpJ8FKJB0KpQHRbQP9dmqJE6ItR9Vzg1HFqd9DDHjSw/RMCOzT0aCino98ZYpGKQoRet5afyqce7B1fuGInSknrgbanudfb/HgxGwqKyIXw6Yjec2TRu4Q0bAaiEHSdRiqDn2SlZ5MhOiEBlOBjkAGqBqwYhl9n/lqDBFFawABWHJn1uZ6nwFRDQDI4buZa3o9knKdDrEFw8mlazx6SzKqDs3npQU7kwkDs75ca1m7AWxPLgxjZ9aJSGIlYKICpvyPO+G58QlTDdhsyVXAGw+rG7AnhMN8k25PjWK3Vm7w8mc38q91CM+oVatWrf+o35xx0JwCgIO9AAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAADNcxDurEEYGBhqOQjeWlKcKSD///9aWmKUWgj/5nvFxcXunIuLi5T/3s33DZBWAAAAAXRSTlMAQObYZgAAAUdJREFUWMPt06FPw0AUx/EjI4QJxGubBnA9ZuZ6ubUZrk03/gG4+QZaVUMQxZAsGJDMkMwiaxETWGax/DvclX/gd4KELPfV75PcS94xl8vlcu1KR7bge/nn4N4SbB7WL8yiw7Z9HNuI47b1+JjB7UWbW855BgOvI0+DAAanXcd1Iwa2z7s3A6IMBXe8L4pRMNXTGhEM6przqQVIlfLMi2CQfG0XGhBlKFBKg4h8BjZQqtbzOGDyJiddzOAE6YoRDgY5kaQzHBx8ysl1v8MzurYIt8KApyW4NoVKxAaAmxdENWXmr75j10SSSDIbEEiZGfCBgQvS/QJsh8aAiZ4drjGQ5GEZiPPhbAVe7GDSLHzyV8HsJGaYSC4F+SPK5yBghSDyg9dUMrCqDMvcr5IYBWneLNJCSvzA5fyq6sctSBEzl8vlcv3TfgCHU0FYyYlm4AAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAIVBMVEUAAADNnBD2zTFKOQCcewD/9s0QEBB7WgA5OTlqamr////ewurNAAAAAXRSTlMAQObYZgAAAUFJREFUWMPtkrFOwzAQhotAYj47qll9SlTGOq0IMOFgwZxK2asiZcYpSKxlQOVReEsufYLfC2LwN/vTf//5ZplMJpP5txThIek9MZcpBlU9c4EbZ1Xfb9gaWFD9JDC9JgT0LIIGhYvqFIDP5HlqcFSWlphwx8LVsIOFWyXC95cIW0y4/2S2P8cdFaDwcWC+Ph5s8QSWvlQs2OAlAOONuQyBhiUqPIcQPK2sRkcqY+F1w4yu9d2O9tFJC3RLazL2JVIRbmYY543WzuyHZo524NFpxWwHNKFryYgwn6NCyR2tlHGwsK46cntHeMIksCe49CTUIsC3NLadUSXhQj1anSY0NtZ4BWldR6eThHGhyKUIMXjSUgFm3ZYxSWg21tDpuOG/9hSHFKFdkJaJcGobZUcpEWkBgpOAtIjtLJPJZDJ/xi+2tD0Vt6eAGQAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAD///8YGBi9rMWLe5TmlCDu5v9SWnv/zUrezfb/9qSDSgC0YhCcAAjVGDH/lGqdU06eAAAAAXRSTlMAQObYZgAAA2BJREFUWMPtlj2rE0EUhpcYsLA6rhgFlZ2TjxW1cN2wErAwRlbEbmFQjM0aiYUWus0WdkJg8KuIgtzWKmylwQuijYiFqK2lhYWt/gI/3tlEbZxh0ynkwCX3Xt5nnjNnJ5M461rXuv7HOrEqcNpbERhMVwV6Kyrq4fQXGh6uBLhLxYDIPVwFSHvT8pUAuFUUQbihFX0AAVVR9F0oFoK0EhC7UJSCCIwluGU5lC0U9qZLAYWWfLBYDs24vY0W0Siw7zoYEXUXY0JP0zCMrLtGIzux4vESRU8bndS+awAExY5yTBoQhOpZDBH9VsSEnkQpsAAhApcFFFoGhaDdFEF63NhRRHnGpaIO4Ah+7qeYkhlw80xcbIY60CeXySXdZWQGGnp9Hl/Sgz3BfD2gHoaQmoHtInLThqCFIvPLoQY7zEcuQiCiX0ADOv0fMzBIMVY35RevSyBiAUFEZiAO8ibR+0fq9mMAIK9rAXymqufMYk/xaKaGAI6yXwoswFYO3IsHimKmJo+dU8w6HVg6cjIxomNFUdz9KIcvkYfABkDQ3xl8gODTvg/DxCcIcgDmjnKvTnt33Zrd+/IFwA0IGnh2lo7YAfBZqXtff3zYlFLE23m76A7st8XeLwB+fJdtKVsPWTRaffulUd/7Tam7Hz8nUp5l5ge5IABWxUellEwgSNg/OfA79lsGijNKTYYCgGzFKfnNGICdeDZ5N48vbsr5u/GY/E43xJislV3gzkWes5RPI/JFsLNrzoaH9dPjzpg3JWo46gIgy+mmS87WjEdjPiiZoXhCfssC6Kv0BHtbRsybnOcgEvKvXzK+QfVdfb/Lzhb0NPfzPOODCTHt7B83C9wQG6xx8yrnRfEIIsFEl8yC3aH+UPCboytc4Mze5Lbvix0WAfIa8OIr+4s8Vyph70TmmQU6f9/bikN+5o2PPSvJXo35mklwH/mNI04t95xtNxnVBoAz7xsErs4jUcscZ9ucdclXuh/f9EmO5Rm/lQCfUxMMKdF//72luIc41kNAU4eUUne4rQE2fbdYxHGW9GtbyXOTV23PfKYRX1Y5x21vZ/od5FQppAA8n01k4lUHnLezCVfKYwsLQFVc36ktcucnFfNblxs9lzgrCZw31QR/HtPcqQysWDgY61rXuv6Z+gn2IOpOg22TsAAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAADmvWKkYlpBKRjNg1oQEBD/7pxzSjG9KSDuYkH/9r3///+Dg4P/rHO9vb1w2aCRAAAAAXRSTlMAQObYZgAAAZ9JREFUWMPt1DFP20AYxvFTkeWub02due8lqsTk3jUlUaRKSQ+8hphTh3ZxG25OIMISG2QxEowgPCIhIbEzwTfgC7AwsfIhuAgx+z0GpvvLo3967pZjPp/P53tT4cQRzBxBoQoX8SFUqXIBKzOl7IQTSIuriH6iS5XuXV1IBzBYOQeAhAo+HnwBaGv6wvH9gc4ynJAHHqqT3p9M0EFVnfFeJltkILtnOUg6YJ1515hI4pAKuuW+BQJbVLFUnZpcIqpfCVHIHwYENpXiRBECfLIDSg24A2guACZUAPjdAo5JWIQTCoj/icWAkDM1S2tFmMfmP6rBAHmERVOt1YFdYyxAO8Cjr4hUYOPftraxpYe1YP0VxPmotZmyejA2uUBugdEjrH9AprvjGASi4MaMEOuPFE6h34gWVzDrv7Vm9W0WjSkIDhCPPzNKAdiiNkB/mQbYBizSsAxrNBC8iPZGf8hcRNTWjFqwCtBIGL2luV7dcfhddubMfuR+3pXzTlkm5IGn26x3WB09MmpaB7c3pdbMob/XmjkVDJnP5/P53q1nQbRmy+krS4QAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAD/5ovmvVqDUjGse1oQEBDFMSlBKSB7MSDuYkHec83/////rHN7e4P2nO7V1d5pCicBAAAAAXRSTlMAQObYZgAABBpJREFUWMPtlTuIE1EUhi/MxrWxOJNEK4s5N4mW80gIdmbm4rZZ4+hqUNRiNCC6GeOrCysuURsbQwZsVBaWKewEUcROENLYamFhv52VhZ6bh4hzk0x6f/KAcL/8/3nkhv3XDGnmkoCVXdIAlgM0a0mgDMsBWg3AXM5gOUBzlYlWjs80UCdy+bxEdQWAM2JqQt2jFeSzE+WVAJpqAwLqK4IlZKOnNBAOATU4rrAomCoDD6z8CiQAzdQQPRVggZW1ko11+aatsihLwFP0yUXewYKXBOiwRQZc0SR0UZiJRDboNeXkXCLIQgEcAuUgNJQSzr+JDJAlN5zjijkgOkKYyRKykBeQU1lw9ISXTJQFAQlAc5wyAYWyMP+ZAodsDpJ9tVHKRi68fxORA8lUAhyxLDb/AtYgKxHF4DT/j8UaY/uCCdCGHCHqX1DllMsdshBic1/ryaSENgA46jkwzUUbnZCItVZ0cfzRmkFhKFJOYaBRFfS4Q+M+EfV7vd4UqBHgKAzscc1SrcF2FARElAnQqWjHb5gqoEAWpFL0MAqiKOqyTghgjIvOJiM5/knkkrj2cUjnn24MRsCoq+qrLzMOVRo++zj89LTOTq8KCVSNCaCuwsHSp+EzeZ7tX5Vd9cDB2ftNkUQr+Djsn/LoG89QzYVxpHxdCfjSpNUKogdCrlSHAACduuoTnpTfkLPgV1utqz8aQtTHQM6hF4eppXFa8qOtoPnaLwuPajYgZ9loTEtWzsIt7d1o3vLJ4pQIEWAyhpmAi9f3XiL4/hjAydzUFtpovx/1YgvyBIg1RBBOCNVZQEb2iVeKPgEUiQwKBoQcsqHy90DynQy3ebHxHPIdAmxaLrANA6rr47mpTeyj555DUZBcjp5zpEZ5MmQws2y7GK/rngTQtXmInbn/6rSw/I5fLI8MdLtqh/oRay5Q9MmDdyRQAzyCRwDu3DRnA5l6Rq5gh7ZOGIAYogWbbK5WkdM5ALmnPAyxnWWLgCpiG0YS1Zu8arIFusVCCi6li3pmk6XQFMjRiqfSansKVFg6TQEvJbAKE8BZEsimBTQDSIc/62mBmgVw/vPX15ASWIEa5H/uSmBRWw/sji55yMHhD68ef19fCHyLv/S67D7okP9xbndvIXDg3Zv38a68Ayw4mY/j9crV+UDmdfPdlziOXyBHvXgublSC7nyi3vQ34tj3sVg9iRd2+MYigPmMPdqhtzrLnN/bKeI2ZVokCUg1P+xspAEOvK1MCvrlB1tHF2ZizR+TVm77W6mA6ZW1P7iMEkhRxBTYKgVbeDs1sH0FR8AgrUFEiYIt41i/mw5oRYYe9C/BsSgdsC/qw0F6pgb2D9pQigYA9x6mjNS1rIfRwLDu7k8JME07Gw0sh6UXxRpobCl1u+y//msZ/QZv+SZFB6GFdAAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAKlBMVEUAAADmtGIQEBD/5ouse1rVMRhzUkpaOSm9e3vuYkGLOSDmpJz////FtMVOy/i0AAAAAXRSTlMAQObYZgAAAyJJREFUWMPtkjFv2kAYhk8eQGI73BB1O5/ARFU6mKsadUVWMnQK0i2ZioOOSslQEhJHLRNDe1K6kI1OUSSGMnZIkLyxJnP7d/rdYUfJYO4YI/ESRQh9j573xaB11nm5EUKscl4QjDHq298fMh1qC+j71+ORLTGF82CsY0WUxgDo8+l0TCyA3yPGPsD5rynn0ysrQAuuvA0OIRaVRgGDe9/DimiZAWf0jsG9iPY1QcwAf7UxprTT5EBYKSavNm7mNAxrQFgpKOXbc1oNfc5BYQaco1sKAA2JAIVFp29JMowxpVWCJlYKACRmDVqNUAkUNkA0dNWvO4L9Np2Kf2TEABCCgAJvmEdsSY+xhr8A9i0Ahy4EAjqdcYsRRReAiohoHFsCDPI+qoZhGMcwwgicKiCAe0izZl5d1MAOXGtiH5uAmKk0wjSeCSh2NdAPM4VpdbGnAZiQKQyrz0+fAZ2wCastAD8FdkFhBZxnjfoALOtUFCnQSYEudFoJ2O034Yu1AEQG7Jx6oDACOyJTHLLGMoWzANyyUIpdDQSgoPmAenBB0BBa0VEA8zDnlOQBkctc18W+VuxpoIyBaOUQfoRxEGAANNHfcxlrcIzBkAN0sU4ZAHh6cQ8zhmvqgzyg4j0CcX8P3rkBroEC543AbQ2oTt3NXqo7414u0C4/dtLtKhi3y06t1c7r5MGFDtUAnANDnFYhD3CwlxEezhQEUXjlKTIAuqUKqOPAK0+RHYIqVVTKaFl8/ETR1p0EWhrviaKioeUG5OgizxTEpKgsJtNMQYwKgXtpqciyk34Km3H65AwAquPKpKVGcAr/bDqdkJICvnLuaYUJ2JIETer4hE95Sys8A3DxHaFSK65zPlGlPNOGuhwqQA4n/AAIpfiUfy0iKuUQDm7k8IBz+KNELNlQSD4mM/njLyyXQ64V1wiJfMHxv2T2eSYBKEj5pjS9Lk3R0rwd3J8nMqKosAXNKDLGGcz9e3V3NJPJRWJBDEjhgagtiUzuLuGtKUVSOCZgerj1L+8kABahSAHE+TmPBwRZxvGh3RydoFWy/QWtFoegddZ56fkPQm4o8xaKGpcAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAC0c72LSosQEBDVnNVKKUHu3rSkcwjNrGJiSgj////mzXPmWnPNzc1aWlqkGDn+ESggAAAAAXRSTlMAQObYZgAAAaZJREFUWMPtk7FKAzEYx+MdhzgIfrkeOnrRIqJD9KCt4HKa7u3ZjiJYiOemFXuuWto6uIhQeq/QoULBqQ/QWdx8Fgdz7QMkAV00vyHhg/+P5AtfkMFgMPwYAHr5BcaIlpBjBNb1BOZ7OoLFQowrOkYEHmgJTj0Sgh6++9uC9QeEqrZApREynzdYURQshuejfaQoOLXZSOfKs83ZkD/LLeTr9SrbqqoKb16NsbCcND1RRRRJ2RF5lsOTpmeRdVUhBDwZuz5g+Y0S5IDIA+yMXbF6UqF/5YgcjgD7mSD/P0vnvoidvYtlT0lAWd57HcJJABl5qbAZAux+DWE1Sa6FIO/ax9DlPE5anF+CyjNZa3xOmj4rCUucv5TECSlkELmA0nQUdHkMAh8TQqXC8nAU9HmMc2G1Q1QE9DkKBjzeZ6z0WCcqdzr9OJzyRk0IKYpIW5p3yPbTlNMaO04RsntyISLbvVYDCUEUpcGNVCiS/IBThzFXFAdFadP23UPFDpDDQppVNpIK7U62Ld4DRWrQWbAVu0iHxQtOtQS7UNAR5t0aDAaD4T/zDfwbWuOkG+S4AAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAACkcynFlDnuzXMQEBCUUhDFg1L29qT/zZzetEqkgzFqOQD///+DWim0tLRzc3OpVg5+AAAAAXRSTlMAQObYZgAAAuFJREFUWMPtlD1o20AYhmWQM6QYfCEhGHWoD0MxGS+lIBJQ45NT8gOpawmNHSShtV1Ena3ExksHZ9OYOmAQDSTBLQRtoaMpBQcKmTt67Jih30kWJdCTbCiZ9Az28j1+v/eks5CRkZHx/1iw7TdzzTvdbmcew+lo+jzGQhtmwZhdOIAPMECbCyc9Inc/qHOQJpSe3BOMhIgcKgo5EOBLCi7inSy+cOX1iiXkoWov8DwsCSFWl79TsFLtVUte1VvzjoeX+DzaKeGcHq00eh7j6nhXQ5W4tZYgvCp5AMYVTVtShAijLXBBbL68hLEKgpQrpgpsvvL4GuMvIFSWziOB3zrnHnq9vb1rLGksAQdRCb5QeLrqHWMEK2lao7yFcTFJ8H3hp+u67zHGa0GAMN7C5fMEoUCI3z+7dV35BK26wDKIAiPPSbipbbYmo4E7gGHfH1LYqHwRCrzXT9xvjUbf2fgpfYEZsBNfAAoyCNstVjomFGyOsOj7k9G3HZchXWIASoSC8m9hTMZ3k1/UDejuwD38m6DzhAId7939ps9bn/CQRgmICZquCBxAoHTgvkV4CpLA0C2esDg+pZRuQ4UWCh2E0DJUsHjzfflzmBCCglBQhLxm8hZa39+4g9Lu2ZAGoF3iMiRA5yan86YibkzCY32HMTjRSnn+If0QxA14cCCQ6DEjQKpbIHDZGY36ME+w1oDfD/kKG/Gpne0ThmocxYKaKIgwLBOy/qHbbpQjoa4nbJTXKZH7hBhW52UbTYWkAMOwaI2AoB4Z6lRQlUSBvibAerNumlOBCglQUfzYZ8YzeFonkcACEp1bEhq0JsdCGmM4pj7LCY1lIV2AiyQz4WRGoVDYJBFx5/SMWIgrpGZMDTkOSDduwlfKlwJTnWVe0237hgJ124b/pFTyNsCuJVwFW7fSBd3WbZOVFZ2mo7fTBdW0qRJGOZrTPEoXRGrGL6NiKDOdkxKriqgIGRkZGQ/KH2dkCbVYG9HHAAAAAElFTkSuQmCC',

    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAAAAADuUkqcUhisQUqLe2LFaiDurFJqQRhKQTn/1c3/pIt7KSn////FtJzm1bRlNJq+AAAAAXRSTlMAQObYZgAAAbpJREFUWMPt1LFOwkAYwPGronFg6AmN1EW9MIEaySWGUZrGQR284QYTNTEkV3cTzhFCorjhwMDiQJjqZnABB8VRBll4AB+AyQfwg8SZr47m/knb5X75rr2kxGQymUx/qAjXZRQQ7BB1HQ0s6nI0EEQBSyoo6SuVw4tbHWil7QgjtC5pVauV8RNAqBuF/rI3gS5VlLpAT1j63l8bTdfH/Ll1DFhtD0fKhvWZVqaFALGDVmFULMPzMRu2EeAw7KVrPF/xu+1u2MGA3mCTc77MMp0w3EMA64W9TUH2MHzEgHnKYELOY2mYgdlSIU/fATDmwQzMS3sJzicASncRW4qxKUgyyMu+zgbxDV79Bexonu/MApafqFZ5NelNtlTY1QhAEyleoT6s91d0kcws6QrBHeFDBVUsY4AUOdlMAkjc1TEn7TrSacp733+rEVSOcJtSNihVOo8CMEGeABEphfvdWIK6DTA2oSkcaEhoLAg6t0md8/E9HlhSWHJsE3zLdULPI4B434HzqxNkC6d9tnVM4h0sODv7om6dxHsDJKAPlEAfT882Vkzv/eH2kETJ/aTRgGUTm5hMJpPpn/QDFYZ7l9HHJhEAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAAC0cyCLUjHVpFpiOSAAAADu1bTmQUF7ICD/g2rm1bRiWjm0ICD///+spGp/pUnwAAAAAXRSTlMAQObYZgAABGtJREFUWMPtlT+LE1EUxR9LAgEbXzKxzntORBCL7ItBsHkzO7GxiXGGrLFSw3yDMC5YiBKSgK2YQRtFC0cUVESIrNiICKkEG8HG0k/hudmMrslzZ+0s9ojDMnt+c++578+yA/2fkv/oXws1M8rTfwXWtMmv6sbPsGOhPtZbepvTLKfUKYM/Fx4+FopwGdiosw2lWkag2FgFcqqOAjVtBHrh5SNh/c+XG0pvUEdmoLHeCCv2Hw1RAVNH0IWrPbWuQnf3aHM1VTlqLgAAdvw7shsQvOTWlNKYoBngqh5e1fLXuli8CKaOhdAmoKaOKt64shZW0gIOF5yXtI0UJkABOKp6aOp3Ac65JSmFGSCdDa8s/NzhJDcdkxmoN9K1E3VuAZElpcrmKY12kEWEtZJTdNCUU1KntBE43VenbxGgd4CaI7hFba3TCzMwRF/pVj5qof8y/hddWTEB/rB/OiLAXQAOvOfJL9S6wV8YDPvDa8ixThmoIwA++TkVXdVwM9qM+mirgQwEWDB7LlYOU9J/Ay4gRGNnqsLi0PyhbFNHw040jDZnCLEAXL5n6ELU6UfXbn/4NSXHIW+bc1saQ+ejzrXoGhVQeg0fzHEn9ZeMofNoKLo+C0C4x3oALAGz53FuDg0Amn2gEvPNNEXcNHTNMw0pQoHrM8pAcz30FdY0tMnPOgA+fkQBCNt7+/McaDqwS1kxAqPRCEMi1Sts+4uNTzc5+ZVpSIXOIBT8OApAZ3vsUOJSAo9DxvNWuPPlGz5XvUVASMBDTnIwJON5G985+RmArG5Qak9Pk/MpwK1g1T+K4yLmLqVsKiJ6c8AWFh7NltEf35QoACHGmfBE8tzhMDu2h1erAeJ4MmhLGfj4bVW92n77LglE2tHqOhfGcTyMbgJ4TMSlp9PtH4/Lgi49c+ZhHN+JAvhZ91EbwLNpkjywaSvZnIBTqwFGwxELMItu8hg9Jd+S5LsrqCM7gPSSfyseFEaLHZgkKNFNkkC2Fx1ZejXwIP05LdENZFViyBZFri8R40mwe5MTALd0AViORIKlCIXJJtutAD3tiIsiHbflzPnlkbVdcuMccxw5WucAjj2Uc4QsEiIQGVcSrtW9hbkIQQBdw5ag4793ATqRRZRAOx4OXCkbgKgCEmOo9UBltwRRCCwa/pLogGVIEDAPXeanshqC1ngKOKULylc6E0g7cm3VzG4Iodvo3Xd9IIFN9myi7DjtqiRV2b6AloPP/wOQZ025f2D2Ho9/AA49uY+n59JpwENnAtPXb2YsJ335VhRtKVuZQHDpyd0bBVk99+3FWyyEz7JLBJ8mQynfdu99fdm2XU9nlmCb8V33xLfBpHuTTp7tZRe52M9d6k62Or4fYFw8u8gYUfNb47FPooOdRUxbRMVbgd9ser7kWcShxzuX291Wvum1JRHlvXdGaw5sTVje85tSBC7Hm2yNJ4z5vtuWVi5g+wLuoFjg4oLVbF/aBoAa0heGBKboX9E41WDpPZm95Ac60IEy9ROiQFVyrcjAtwAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAADNYrSkSovupNUQEBBaEEp7MWrmrFr/1WqDUhC0ezGcEAD2c0rFQRj/5pz///9VFNuSAAAAAXRSTlMAQObYZgAAAgtJREFUWMPtlLFr20AUxi/BHpLtsyribtFz1MyqyNDtCOeACQXpajdDlxKK9oBBTrZCwPISGhpInaVLoCFDtk7un+AupWOz+8/oOwtKJ92ZbkW/ScP3431PD07U1NTU/O9srio8fFhRuFtVuHESWhT8qTQRdhDHUShK7ocueQZJ+ZMWt9b8WmyI/HLAF/sO3l/C5sOZtAqdOH4x/Yhlp7uzU3sjL37+eThZCmu7p9LeKCJ8Oi8Fb89hgOn/dHoJhPy9J50EMEbwYl/YhU4nQqgCgBIv2hZ2ONp/M9MsaC9KHISm6h7OZl9ZGJjFnTh8fPyJFnWBbTfh5XxuhH3Ad8o3f83nP6BJpmi9dRH0t/n31CeSGq13LkJqdt6nXCp6lkmXSkRBNy/GspFlmdOIvlL5aDGW4oAN6bb36MIIbiOIBkJvXSxOpFiOsOfjqJ8CaCXCjDi2dFpHHAAsmKOZEZRUC4EX+fDBPBGMJgqrBxABaSmoUtip3gAxQadGeJ11k2aoWbA0QlAKXH+gKawW1sHCziACRu8PsmOOk5aVB4MXw38FtIsx34DjdGQRYF4NoCgmGd+AhaGwCJ7JbxXFeSnsVt9tAyVtFqZGOLK99pdgTKNC9XiHfCidhDYLstG7ub9VwsLGiRHyojBVlFLCyjUbOSOFI43r3HAlnGn0VsobrlRP1NTU1NT8A78BlVSQZT6abwYAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAJFBMVEUAAACkg8V7YqwQEBBSOXvFpO7FQRju5lL2c0qcEAD////FxcU/3Z0/AAAAAXRSTlMAQObYZgAAAxBJREFUWMPtlEFum0AYhd2aC/xmvC8zdA/8NJLTjQcmB3AbTuCK9AQm+1SJ95UiZd1du+yup+sbBkikeoBK3VTykwWK9L5575/JsDjrrP9bwpg3f2F/ZaqqWsnZ/tdr649oNnEF/8fvmmhmqwD+HVtgtZ0X8PZDVcFNRGIeIJg5JUGQmQMUxrzffGVDc4nlT77cPD2lQkYziWTBFlhJq1nEa9o8HpHgiO20P6Lw81F3gBSTAKqHx6MupSwzANFUREDEF3dfqJAMPxeTEZrCb/XlJyGZ4QekpoEf9S9dlowMrpGynWjEKuacsLb1WyAZB0JO31W7cMNScf1wABCPNwrrPeemRAD8DYCJIdLw5lBjdfwubprmvpgGHptDnUsb0DTNPpInhwjMdgAumuawh40RcLun1UlAk+iIVGzswoVtdN8c2AMEIDpgxTe3D3cZgPrmtk6JLHCS2DqAyoum3qckcAg1kwcAIYy7cHA+1ntt/6NqTkMHjEQERCUzkyZlX5jBt60dsKSQYqzMFiSVjwGiBSKREfownghJJwG84UUd99R2BB8Qtu+cQn4W+QFjHLAkGuz+RtAVld3RvYggALHnHqy7Shh7iNAjjYJqADISzp/RSCO9I9FPE7lSEfzeAMw8fOOWMiJll7eF8oVvhJ0e1sokreB3hfwAGg0RRJ0/8QKVBYaICT+k+03qD89zEcYBNfaxMOYFwK5RMgLkFZXDPGXqgNywP6Ei8Xz3kFfQStlvTeIFdv3BaaIc6xsJAI9kCgiIQk2QUTKW0nvf1tfGdUKZ0G1SJgsJJZ6TvsKa1k+keyAG4IsIBDoJY+AnIdwmZWgUY/yTEUuxrnaanNIBsBlx4vkGrK93fwBtp/IkkGGEDlDkgFIp6R8CN7lrJHug4NwU/o3NpW5tsgdiaYfOvECQF9JJ6RbAn/gpH4BSPcAiIhJatkDsTm4kQ+VLwu5rkq1bZgC8hGHmrd1iaADUYlLuHHogmQaWbYADFAJmRcDudgkBMyIyuNuBS/hnEdweSMzwzxS3Wpx11ln/VL8BsiDLNCknIm0AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAKlBMVEUAAAD25lL2vSAAAACcUgDelABiMQhBQUopKSn/9qTFIBjmWkH///9zc4P782LxAAAAAXRSTlMAQObYZgAAAcBJREFUWMPt0j1v2zAQBmACco2urz5QFEUHnmwPnVirbjp0sGz5B6iOMrtO7KHd6sFz0Q5eM2rtmK1rMuaP5SgJXnkaAmTgC1EfwD04HiHl4+Pj8+JjetYHf54dnHru6Ut/sOkJfp3B6SQBFzRpX16fjkfJAUw7MFjgeDwIQVHMBzkYSOYf0mhV3yZc/54biEBV1zU4bw62QeEUu7d1fWtBZusHmLtAzrVhppNl9xW7trTWvJvH32gGfgU3+MoguuhACWDuAAfs7JaaugpuMPgLm3f/r+zEAvAduCmBh/u0nd85xE99tRitwru7lBtIwA9q0gDdA3z4l6oFNcI4hqYuKb9Zkbl/1zaThupMSYE2W76769XHDsAMJfUM0DbgYbcjJQIsxhoMhrQRgDIGUPLaqJkEBEg6EAXfaCIByMFNQkS7anwtAGULxkiraq8EIIclfKWztZKBGDNeIWWFkZxqnOSIeIVkPi0FIEcB2EXcQQACjTaaaL80AkBoEoYhpUZJANkepLlDqiRZ0DkbEZie68dGBIIpVVm2ZbBWouwviyWzm9WlrMEwTq6byi2xkyT73D3jSPVLZpSPj4+Pj80Te0VcchFceycAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAMFBMVEUAAAD2rCn/7tXeezEAAACLYhD/vQBaKSlzQTH/3lq9WjGUQUE5OUHmvYNiYmq9GAiwjGu6AAAAAXRSTlMAQObYZgAAAwhJREFUWMPt1j9IG1EcB/AHPblARHhNIVbo4I2FDukLCMlyMVctrUPAPk27FeuRbB56nFVKHe702k2K1htFp3S6Ijgclg4dg6B7t44lq6P9vXuXS1pyfzIW8l2OkN8n7/d77y4JGmWUUZIiGmvD1evLQ9ZTeSigU3O4BWjdDGeBpAB20JGhU0ii0LvAgOoldSN5hDoHIqV1dXD92D8AGt+GK9Q3j9CgvKz9NcM2xjjnoU2623R2UoAzF7Oc27bqHNaSQXa24oO8bamOE9HSAeplUcGQYvWeDR0dGbUkkNnHLLMKA59lpA8Efa3e2cd5DWNFwU+tDdheayBweuDD/jFvCRcVeGkPbGnMWe3h13nDxQyRyFsWQG+Itzh3ezOP7zu5WBAOYWgAbjXsOJ+InDEiAQwxtuPfPzDw+xsMYIUYVj3iSYVtOkBLHCxif5ccdYVYlEaCZrPmg8yrMuZRiUdp5ApLh4erqj/GehfkPDxFbTkKNJuq2kCQKilwUIbr5F7kNqlqAEQAYUpmFMgw4B+eQPC1dBV0ReRYoPoPi3tXkiQOSBFFZjcEFQkyzRdYiwd8my4kFr/+HEUnE0791QdXAPyOEqfOXvtgOh7wnnbZECIHj6CnRDDHhshKPAyU5dieVjNsiHc9UPLk2CUaaK6BxAchmPI8eaLT6cQAQd3JdkEBWiLfOopy+TuqpzcIPWm4AXjoHwT7GhAuoxoz4c0XLu4DpTMEEX6h6Agu5tt6DOCL5wMUB5AWAJetEICOHAMq+LEPtL6bbyIW5Ap9gFeOxwGBkAtoapoBkhKU8c8rss4WmGkjlnYcQFXS2iagCOS0/Z0t8APFRWi1WsbWycwJIaWNBRDjsEBs5kEoirJFSi1ZWGi32wpCiQI+U9xiFwEoQsniFIF4BiBd1gkD6HnrLF29GJxwFVyqei34rargYqp6HUMhB/k09RalBQ40PJlian1zmX7kdTqhKcA81W0lsDQNEOzNoF6kqQAKT1as1y0A6SPuLQ/5b9c0zaEANCejUUYZ5T/LHxHGBscAMQp/AAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAKlBMVEUAAADNtAAQEBDu3hC0gxDNvbRzShjm1cXu7t6DYhCDg4P///8QOXspe80BbMQ6AAAAAXRSTlMAQObYZgAAAcJJREFUWMPtk7+OEzEQh6MtVgrdeK3oiiuyzjlI/CnMrFLQeXdERXMLm5OoWG0uWnEdUuQaGlJccdJVqQ9RQEcZeANegYfBIdd7tj35q+eb8c/2jCKRSCQynN3A+jHejHdeGt9whTeLDnE3vn3BFc47ogpvFyVXWAKiIegFN0RrEDPzassWOguARvZT7pEKzJAMWLZQGUS0A4RnXjDKSm6G5I+0ePozl3LKFSqk099nkjsifY6Ir/9qyxauEc21alrLjd1n5mS7qYmYQtJ/Otl+aeYWqOQJ5dbX1xMEZohZ8dgfSLfZvZCGhNyWrtbrzMAxdRdKcgZC6XpmkOAgpCYs9Lp52hkj/791FxQS8U27JyuQsvUT1hUEL1d9vnBXKxDzSTtfIwWFFJRzH7+KHGCSFwUEHyM1l845pSsDkIMFEdxQPAibtxkC5SDDEVaoL5xrlgbICqCw0FHZuE2zxAKkIMb3SKxoPMvMCyVns5MW9EGwEkiAGoVRJLxRSyLIFWvl1uCN8xzA9+dweWdAKZUAiPesAe/2x875gjcg/fHrWDjDl7ylVveNP9x998IArvbNMOHRvh4NQ01HkUgkEnkg/APNT2QWwTts2QAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAJ1BMVEUAAACLYhgQEBD21SDVrCBKORDe1bSsgzFaSgD///9SUlKUewCLi4v3utS3AAAAAXRSTlMAQObYZgAAArhJREFUWMPtkrFr20AUxlWBIaRZnsC4o3WxlaSjzy0h3eQbQrJIwhd1DuXRxFlkGtQxjkIxdEshoODJLQYlW5qhkK2UgP+rvovT0MUnGToVfYPQ8H5877vvGaVKlSr1j1TxFhwOiwNquFqJPaMiixrE/rEfeRW/WtQgDo9rkeeDVWzeDKPQqkETCgKBWYM1C0BKkEGRAH3bsm0bZK0vC1nU+k2fgGotJpcCDs/i4zCyGdhxRAAr8qQsjsggjIFeKbe8oRH2WwQ038YRNCXLBZKTMCFgPWlFQA5Ql9LTA62PvBVDwgmgCJYEyAFeKeAF5y0AmzxsqOoaZkYiVvmNAgZgSSkDfdkmsCWR8LUPCedUnD9LoQVgnXPe4N95S10SVMlAG9oGWkZpd2AByQKLutACyQwQg4ECmjJvpxnQvhKnMwOo+vrjYGMFMIZMzdsPMaSeWKUKpgSQbFDy9c2NvxBw8XIf91kTlGROEzvkcMMm+4gNQQ5VNa9JPVxtf+X8NaKDvR9nrpTdXRlo5pf4psg4RxwjUneuILknusujoRUyuEK8o8dtiA4XYvuzDmjXV9ILCtDjDwDnb8hkeHc3byMCjHt0aCH6FY0OfW+J6GzOeSK+9c01ltknxOSat913ymZXkE7mAdNLlxbbRmTp7SOwTfPr80rYyi7qxnPeQtxIr4XTUyuJM3f+NWUEUJK2g9kovXV6FFoIpunhfpQqgLuH6WXK8L1Q0l338ujgnDK0RZZOR84j4OkAzAjoip10RAaIZ6ppQ6fJIQEVMTma/qT500YusDxhBlmMGfOGjBlmQx+BZNbJQco/m5tDcsjV3q+nTUyRa0EGR3IxYO8euyKYjXU7dFK5Bohdij4DrtQ56mU6GDwdT3CgzjGPYH89c5rRsSwgM904NxaSszHHQLNfqVKlSv13+g0899MDkwibPgAAAABJRU5ErkJggg==',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAJ1BMVEUAAADV1f+srM1BQYMQEBBzg6wYnJS9MUr////u7v85apT/UkHe3t71JVTSAAAAAXRSTlMAQObYZgAAAWhJREFUWMPt079ugzAQx3Ek6AP8DAztxtkdumEu/TMCIWpXEpCyV+IVGDpVarYsHTNH6pAnqNSXq4Oy57JUHfzdkO4j+4Qc+Hw+n8/3n+JLhvuewzjkoGcZu7rbKdZW3QOUi8Dt9Q4NaUDpQFKL3ef4XduYWeUyAKzfPvAw7K2W3Chzl0/H99UwvDKxAMRbC9fNBCg/D9LtfAJfw14EonQ2toqBw4EL0wRn6/A8WmBWxcxUCn5zgsfRxg0SIjKClcFV/HM8oUnmnIdnVwg5mIAjMGVoc8EZneIsjeHqrBKAdpa52crCVWvRS6hBSCo33yYOCIqIcCxllEKQnUBrWAJCnOphZHeyp3GAygsAA6q4CGQgKcignCCipRAUiAG1dEIKSKctFbQ0gajCkNaWal0IQehmiaheUSkFpi4cIGPEIHLTjklBb0IHmoV06ad1Fyx6E202wh2ipgxeHGqa6VOOfD6fz/dH/QJNnEfOyP3L7wAAAABJRU5ErkJggg==',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAACLxc3F5u5alLQ5WmIQEBAYOXNKg/b///+Dg4MQYrTV1dXFIBDuSjn/nIvOAse1AAAAAXRSTlMAQObYZgAAAjFJREFUWMPt1DFv1DAUB/CgNEPHFzsfwO/CDZ2wndvj2CeQWNK7IN3QpUsq9QNwMxK3syB17QISa2FAnbpVYmSGmY/Bc+5YY59YOuQvnc6Df/Z7sp1kypQpU/4r+sj56exYUCbpiyOBqo8Bz4QW/4CO6UeJHA5AYxkDAA5Ao6gjQZFQ4ykij2i59oCTqxVCDCgJ+JqUFV9uwYUBmgGk2Mz7ay9DUcyDNkXV9/0tC4NGHMCcwGVMEwignbP46Wrb9xElnSjBckSF/Xb7tgcbFkYoJHB2NYCmDG/hNxBq/pnANY+5HBo9OHu53faXVQRIBQFQwGkDvcLnQaAGQKH5C8AiDHxFHjBdrQHCICXABrA8BwnFSR0AJwIFiAqGMOAmeNorBDXbSNinChf1AKAu/rwbZhMzi1BJPwHg8XHmAXcAdGHHvztG08TfDxIYCUvjNnGSB+83hR/+O6thDFToRdWBZr5xJq3WejH2qAewMRyQeWkKAvUIwIYBX/6QPEchGVSWE2jHbkZ5zi9+WTAEDFkL67GKTqnnZesMcCdzaAwwD9oRcCf9clmHjZCwMr5xOwaym93On15V5jjjaPzRVaNnvWn9clY7xLJAQxXBoh0DGf08MIiwwhKoi0USzlqbXHDaRPp3FAE6/x4KRLRSRoHMgwaxsJrpmJJOOwKdc3Wmta5iwHsJ+4VtZV0MeHPHvg2Dr/f3r9sYsXv1fS9vdlkUaLMP+9HHNpkyZcqUKU8vfwFsAniAK5/lowAAAABJRU5ErkJggg==',

    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAJFBMVEUAAABii6xatM0xSkoQEBC9rFrmzYuc1d5zWinu5qT////V1dUA5tatAAAAAXRSTlMAQObYZgAAA45JREFUWMPtlbGOEzEQhjfKFbRjLwRBtbORjhKvA4egySYOOtEBMcoDcCtSJhRuUbigFQ8QsTVXhQpBBS/HjBPIic0S0yF0v5QUyXyef2zPOLrSlf5FtbT+q3gQiHcDY3UEESBiGrAsf6lEvW4hBiU4kVHURjhJMkx1CJA5HWmtMcXuyGbJYaB97DQiQoKnpX2aBgDo5kjKumW5fB4ARNmxY0CcMtANAIRzHdQCHwQCLedmDj5lWBLwNAyYvzbvM7xTllb0DwMdAh5cPBFIKRSGADOqGQARuwbjEEcCd+qHHMMlmSgESHpGISsxQd2AuiiKIZQLTECGAL1io1cIAEHt825LLP4WyAHCPF2rAWEpXgGEerrGxMs8FGCiLM9z8JImBNAKfkpCwOHBTMIvKXaltf7j9ZuD2gGUgodCb+/SwCsJh4m85CnWAIiJrtcPjqR7iv6NLwOURWBy+6JuZSZ4mg4yAgSSEu8pJggQ5Lf6tLj9maOylABkeUJRjr0b3F6Lhx6QKYJcoBdAqdQGiGud80k9lLyoJM/3JtsUN+1broN0++7vwAX0cu3LlNoW5cID784m+QaoF53v9mX0oqo+MFFWq8kR5N5S7ZIMgcX/5MsXUyIQ71TVyr4x/tf6AHn0Bbz6OYzsalWtFhugHxkfXwcMsEzEwHQ6JeBdVZ0REBmzt/sj4+PbAEv7gpsaqTEsAc0ytBQDsWVigI8PACwGRNeyBjiyNgBQCnFJgWNEBieH1tcaaT9HdjxAxHNrz01z53BvZSmyumawGa+nMTR66qRtjZg53CkBiJuH0wlmiOmxm+P1Z1sAAPI/AOnxHFN6sRI4s7+ud944nFpZ5hzyJ4X7lbX+dpc2h4YioDM/8cAcJdyoqspO6N21Y9gLtABc5zXbz2hdBXJKxOqMT0MDDPe+tTNH9SIDMgFZUHxhSTn0jKwD5LyDKc+MVAFv5oOi8PGThqGvBAoPyO1mjsg+x583jPA2iMzbZyBhgGKNOV1Sgv27ZECB4uwCETzgNe79GjA1YsiAH0E7YJyDajy3I3MJkIZLMGQoVpIcNSA5RTLVG8Zw0xhzxKzJ2VJTEgANUlOUn0IEHHrozFDqDP1UYYDSMf/lT/256YJ4y1MVD9f6e7+5QXED9Hcuv68vTDPQEonYAbvR06hbH0EAkqNAtdYfAdaKSg7UEeW/9clbDtejr9Hfida/0pX+F/0ArOoWy9IIOKMAAAAASUVORK5CYII=',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAAC9YsXmnNViQWoQEBAAYkHuve6cSqwApHMYzZzNzc3/////alLeQSm0GAAmdOzmAAAAAXRSTlMAQObYZgAAAYFJREFUWMPt07FugkAcx/EzmnT+cac7f2hcwUNNdOGQpIkbA4kzA3vt4MymbyCzfZs+Qqe+SQ80Xfm7dLrvwsLn7v6BEy6Xy+X6hyLxXKPgD44iJoj6ZyhmKQv4OrwDU/MAQQmbR2QhI8/vASoCd4MOjOpKFtETwCNZFjJhzQwg1RSUZQnFBgtaloczawjvDgL7/lUJLtDVtDy3VzVmjH2EbVUtD5e2sRsNg3fYZFUe2rbZEWOIlx74/YnAB6/lpQNKRJwzaZ11oDFIdcgAmiibFssrjN55DDCua1oAy0YpBc6nW9V15UEWMFBaDf8ZUtsdyAIFQCrO+mTzY2kALdPhCWYPkACkEykGM14HgFgu5qd4NwwmsCKIYeR6fgIHGBBtekAnKAYINQVfFkCTzwLzD1LfuMcDR0p+IIEYYN3RjHwAygs1D7xkfgzkCwrF2zoRDGAA5GOiVExunwywTTa3XIxhgcg5I+z328iyrRLMJvkktWzzWJzPhMvlcrlcz/QLsEtQwQdswcwAAAAASUVORK5CYII=',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAKlBMVEUAAACUWrTNg95aOWIQEBDmrO4AlGJKzaTFxcX////eQSm0GACDg4ODWlJFhQ17AAAAAXRSTlMAQObYZgAAAmNJREFUWMPt1rGOEzEQBuAg5wXGNtd7dtPHdiIF0exmfZFOJ4rsyQ8Qik2dKjUcDTUUUNNdTQUtBY/FzMJdh+20p/0jbSxlPs3MuslsypQpzzurp5PwJfUCm8ejqy4DHpcXAYGmCDhcPR7UrAzYsYUva8CbAgPRYyV80Qp/wbo32vIpD4zmr4gdgPalQDisD6A7bAp2Bs3PejdA40whEIi7gUFdMhGBNdbDMGiBuhjsnsAyOxFAF7nBQfMKos4Aw6BncOqQ7sHlAFAUr3A8dQYakXuxdgS0wvF82lIvVwzO57ctHWXuJsQ/cDyfJQO+xTxw9cCg8yMQy9xMgcBwPmELnoBwdQYEdLvDcJQ1AAnvMtctdI9yJ68OdausxPza4hoNtngFNJBHxOzaLyJyDornoYPJgn4EhpZH+sgseMmAheQHgAHrfQrQ3IvejgYIKAvUq0nU0wrx7h2iJCARvAUFOlXfE6i/SqzGqSoPlCZRz+/o5Zv3iJUcp6Io+18gIjdA2dHDgqQVKDY1UQhhi1g5RB6FF4DUzhyxR06A8eIUr5wBcazvoAXV0/wjTIHZNW1Rf2SwjobKLTXKAIm3N50GFeNercYWOgn2WP/8bgksoreaW9g0uDO3Px5sCA6VBJqsVT4J5hFuH75pAdtqHZXl2TJLtPr1g20saLeIlW9WADYJhB5nsABbjHd0anMXQaWhIeA1LvYE5qDUKgXuFXh+3i+3iKBpxo3/kACb+41fzoT3fkbAEJj//pUaKYTN489zRMvDhKb070+nPrEuz82rL+EiMA+fqf6ihNmUKVOmPMP8AZ88jDXo0k+QAAAAAElFTkSuQmCC',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAALVBMVEUAAACkUpTVc+4QEBBaKWrFxaTelPb///8pe5Rzc1pBlMUASmLm5tWsEADmQTEH9O4xAAAAAXRSTlMAQObYZgAABEBJREFUWMPt1j9v00AYBnCjeOn4+k5GDAz3Jgqr7UvLHwkpZ5sUwYSCB8Yk1e0IIguJBYkhEgsDVZURsaDyBRDMiI/AxMA34Tk7IQ0kTjuw9VGlWvL78713vnPrXeYyl/kP6Xue399Zs4o/8fy03VzvHy0uWrgeTPKUo2YglyCO/IElYtFc31Ld/gLIwUjmhnaBTjpZgIGV92evDUBjbr22kZdVYHR/Npu9pv4OMBtMvEHkZ9LKr18dEDvAGwcmRkg3wOfZzES7AHqSoziWR2jozeksw6vbBUZHTDSQFfjY99J2I/g0G4QBKzL3K/DB87kRtD7NXtmAWSoHvgAYjhrB6edwxEinGuA08omap33nc8hV8tmbL6fa2/2u34+4zkM0RDk1giuEBAvw4PRDTNQ8wsDaMS/TcfUQUcMp8vM/IuBOLGKhtYwaT1Ges8u4w6zQfsys+y2tdXVv8yyc6I4PmTEbJeB6WVmWGrfsBkEht9MKBIzp5qllJcRQ6wIzCcf9f+oxg+wIT508UrJDlLDlTp4fWNaRG6LzTz3uty0WaJKo50pmboUHduJWog0Rjvrr/eNGDTjl9lMyJoDt2tTiQdwGCNeHGKCeJR1UC3vXSDIEAN11gPXfPflM7PZ1BfRPI+dLwHhSQBRdsWvTTjvThImksAr1P+he8ZggErdsgABeSGcBdcpEEeWJHrev//glCwBE9CTqb0zdpqKxWNXvFXQYo95LWN80JO8VRWGcMADqxjSWGd5Eew0INIQNTifl8xz1GAIid6+DxTQ+HP4FhoT0a1C++FZUIkc9iYSVjg+nETZLtAI9cgMg+hpA+dKBIVXJ3E48nMZ2ZFaghdO4WITb2G0Y5Vsx7NXAJADy3oEdY7Ov8i5fbsc5tqcuy2f7j2sgBQAJt3POguPhn0tsz0Lr/eIPYExeEPbuWbC3Aq1iEVODLMmL+MDSOvDeri731wBlrZulxt4MtnykVgA9aR2T6YvywE1BbKnPli0dG61IxKmyOrTjrSAXxXx+jPonxWNmIhFwaEchs8o219P+E7y7eQH0iCmLKQGwI9hoYz2b2yclMi+nRaCsnZBk/OJgM/CZzc2yzrcK2NgB5kBJbzPoLMBLdBQ6QCm7801iE0iZpajBtALcnRhyQFJ/C6Dsez0AFikcM0+EBFCSos1Akdz/7uoBXO/cjXtBqmjLvwWGCLeWb7o9BlCxIOO+/NsBLfdGVgOKDcktr9knkkSiFvM0AaAaRA0A4tjVUwUEEX709j8qhhB9ez4nStvoyIHt9ZhElagVUw0IoKHe8xfAa2l0x5qEk1EDqFoS9dnudVnH1Azm+OIBLHQXc2gG8+pkimgJxjUQ2+r3UK+1Xj4wBchNE2ihem1njdV01eLOAPDVEi2eG7QSVZb4PqHH84rYHaTMO3/2HIi8C+SknA69i2TvZBpdCGClvctc5v/kN8DfVkYZaryiAAAAAElFTkSuQmCC',
    // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgBAMAAAAQtmoLAAAAJ1BMVEUAAAD/1b3/rKycUlIQEBDme3taMSBzSjmUlJScg3P///+0OSnuQTlFeNp3AAAAAXRSTlMAQObYZgAAAbdJREFUWMPt1Ltu2zAYhuEfUA9ZP9FCgnTSLwXNqIMNFJ0Sl+3QTXUIdExTw107SchWGB2C3EDgOxCyde4t5KJCKgd5Iuk5fBdBw4NPFARRKBQKhV5wUV3QLr1uIHxF1/0magAIffO2a8/J3pvLzY2KYCpopW9aF+g2P7CAaab2N5tu6QK/WqBEUqcQwOVNK/1AgwoJsN8tv7jA6uIBiBTA+1a6AK0uhofBRAPmpQ84egLxUSbliRNwA9TA3CycSXnuAlEGIJaSoYFe+Fm4QAUdM4xbT+VsQbb2iEqgAZAAOOhzqc6s4PpPlCI5BA6N+tBnUtlP/XFRA2ICTFBCxFh/sg9ESEQ5ghT9tLaDJk6h0u/AQZJ8K4HjqSqsoAegGsivp0gUgCpX9rdUYWhy9w86A2b2Q7zC0LtHIDgXjm/jFEP/8QyInBNjpRvoibEk5hyFA1TYKubPuwH2AenWgA+IeHuA5x4g3RrIK0FO8CRi1oAzclU9CmZ/MDbnwgkizqoRZOQBOKv5oTzTA17PVNezARTkUXS15hMzxPri095tL83Q8ZUnICmHoevbv7RT5kccCoVCIaJ70D9izGkM7uoAAAAASUVORK5CYII=',
    
]

function substituteImageUrlForImageDataUri(pokemonId, imageDataUriByPokemonIndex) {
    return imageDataUriByPokemonIndex[pokemonId - 1]
}