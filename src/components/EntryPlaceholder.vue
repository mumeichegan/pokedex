<template>
  <div 
    block
    relative
    w="100%"
    h="0"
    pb="130%"
    b="1 solid #ccc rd-3px"
    overflow="hidden"
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
          <!-- <img 
            absolute
            w="100%"
            h="100%"
            left="0"
            top="0"
            :src="props.pokemon.sprites.front_default" 
            alt=""> -->
          <div 
            absolute
            w="100%"
            h="100%"
            left="0"
            top="0"
            flex
            justify="center"
            items="center"
            >
            ???
          </div>
          
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
                backgroundColor: '#ccc',
                transform: `scaleX(2)`,
                borderRadius: '1px'
              }"
              relative>
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
          ???
        </div>
        <div 
          m="y-5%"
          block
          text="center 14px #532341"
          font="semibold">
          # ?
        </div>
      </div>

    </div>
  </div>
</template>
