export const POKEMON_TYPES = {
    'normal': { color: '#A8A878' },
    'fighting': { color: '#C03028' },
    'flying': { color: '#CDC0F5' },
    'poison': { color: '#A040A0' },
    'ground': { color: '#E0C068' },
    'rock': { color: '#B8A038' },
    'bug': { color: '#A8B820' },
    'ghost': { color: '#705898' },
    'steel': { color: '#B8B8D0' },
    'fire': { color: '#F08030' },
    'water': { color: '#6890F0' },
    'grass': { color: '#78C850' },
    'electric': { color: '#F8D030' },
    'psychic': { color: '#F85888' },
    'ice': { color: '#98D8D8' },
    'dragon': { color: '#7038F8' },
    'dark': { color: '#705848' },
    'fairy': { color: '#FFAEC9' },
    'unknown': { color: '#000000' },
    'shadow': { color: '#6c5e70' },
}

export const POKEMON_STATS_NAMING = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed'
}

export const EVO_TRIGGER_DESCP_BY_TRIGGER_TYPE = {
    'gender': 'The id of the gender of the evolving Pokémon species must be in order to evolve into this Pokémon species.',
    'held_item': 'The item the evolving Pokémon species must be holding during the evolution trigger event to evolve into this Pokémon species.',
    'item': 'The item required to cause evolution this into Pokémon species.',
    'known_move': 'The move that must be known by the evolving Pokémon species during the evolution trigger event in order to evolve into this Pokémon species.',
    'known_move_type': 'The evolving Pokémon species must know a move with this type during the evolution trigger event in order to evolve into this Pokémon species.',
    'location': 'The location the evolution must be triggered at.',
    'min_affection': 'The minimum required level of affection the evolving Pokémon species to evolve into this Pokémon species.    ',
    'min_beauty': 'The minimum required level of beauty the evolving Pokémon species to evolve into this Pokémon species.',
    'min_happiness': 'The minimum required level of happiness the evolving Pokémon species to evolve into this Pokémon species.',
    'min_level': 'The minimum required level of the evolving Pokémon species to evolve into this Pokémon species.',
    'needs_overworld_rain': 'Whether or not it must be raining in the overworld to cause evolution this Pokémon species.',
    'party_species': 'The Pokémon species that must be in the players party in order for the evolving Pokémon species to evolve into this Pokémon species.',
    'party_type': 'The player must have a Pokémon of this type in their party during the evolution trigger event in order for the evolving Pokémon species to evolve into this Pokémon species.',
    'relative_physical_stats': 'The required relation between the Pokémon\'s Attack and Defense stats. 1 means Attack > Defense. 0 means Attack = Defense. -1 means Attack < Defense.',
    'time_of_day': 'The required time of day. Day or night.',
    'trade_species': 'Pokémon species for which this one must be traded.',
    'turn_upside_down': 'Whether or not the 3DS needs to be turned upside-down as this Pokémon levels up.'
}

export const SPRITES_URL = 'https://pokedex-sprites.meixuan.site/'