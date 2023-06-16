import { useInfiniteScroll } from '@vueuse/core'
import { effectScope } from 'vue';

import { 
    throttle, 
    debounce 
} from 'lodash-es'

class InifiniteScroll {
    constructor(props) {
        const {
            scrollerEl,
            scrollerItemEl,
            root
        } = props

        Object.assign(this, {
            scrollerEl,
            scrollerItemEl,
            root
        })

        this.scope = effectScope()

        this.onResize()

    }
    run() {
        
        this.scope.run(() => {

            const throttledAddPokemons = throttle(
                this.root.addPokemons, 
                1750, 
                {
                    trailing: false
                }
            )

            
            
            useInfiniteScroll(
                this.scrollerEl,
                () => {
                    // this.root.addPokemons()
                    throttledAddPokemons()
                },
                
                // { distance: this.scrollerEl.value.offsetHeight }
                { distance: this.scrollerItemEl.value.offsetHeight / 2 }
                // { distance: this.scrollerItemEl.value.offsetHeight - this.scrollerEl.value.offsetHeight }
            )
        })

        this.root.isInfiniteScrollReady = true

        
    }
    stop() {
        this.scope.stop()
    }
    onResize() {
        const debouncedRun = debounce(this.run.bind(this), 1000)
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                this.stop()
                this.scope = effectScope()
                // console.log('new distance', this.scrollerEl.value.offsetHeight);
                // this.run()
                debouncedRun()
            })    
        }
        
    }
}

export default InifiniteScroll