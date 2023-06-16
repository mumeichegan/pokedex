import { ViteSSG } from "vite-ssg";
import { useSSRContext, reactive, resolveComponent, mergeProps, withCtx, createVNode, withDirectives, vShow, toDisplayString, effectScope, inject, ref, onMounted, unref, resolveDynamicComponent, Transition, openBlock, createBlock, nextTick, withAsyncContext } from "vue";
import { ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderAttrs, ssrGetDirectiveProps, ssrRenderList, ssrRenderVNode, ssrRenderSuspense } from "vue/server-renderer";
import { defineStore, createPinia } from "pinia";
import { useInfiniteScroll } from "@vueuse/core";
import { gsap } from "gsap";
import Flip from "gsap/dist/Flip.js";
import { useRoute } from "vue-router";
const style = "";
Array.prototype.pushSorted = function(el, compareFn) {
  let index = function(arr) {
    var start = 0;
    var end = arr.length - 1;
    while (start <= end) {
      var middle = end + start >> 1;
      var cmp = compareFn(el, arr[middle]);
      if (cmp > 0) {
        start = middle + 1;
      } else if (cmp < 0) {
        end = middle - 1;
      } else {
        return middle;
      }
    }
    return -start - 1;
  }(this);
  if (index >= 0) {
    this.splice(index, 0, el);
  } else if (index < 0) {
    this.splice(index * -1 - 1, 0, el);
  }
  return this.length;
};
let fetch_;
const pokemonTypes = {
  "normal": { color: "#A8A878" },
  "fighting": { color: "#C03028" },
  "flying": { color: "#CDC0F5" },
  "poison": { color: "#A040A0" },
  "ground": { color: "#E0C068" },
  "rock": { color: "#B8A038" },
  "bug": { color: "#A8B820" },
  "ghost": { color: "#705898" },
  "steel": { color: "#B8B8D0" },
  "fire": { color: "#F08030" },
  "water": { color: "#6890F0" },
  "grass": { color: "#78C850" },
  "electric": { color: "#F8D030" },
  "psychic": { color: "#F85888" },
  "ice": { color: "#98D8D8" },
  "dragon": { color: "#7038F8" },
  "dark": { color: "#705848" },
  "fairy": { color: "#FFAEC9" },
  "unknown": { color: "#000000" },
  "shadow": { color: "#6c5e70" }
};
const pokemonStatsNaming = {
  "hp": "HP",
  "attack": "Attack",
  "defense": "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  "speed": "Speed"
};
const evolutionTriggerDescriptionByTriggerType = {
  "gender": "The id of the gender of the evolving Pokémon species must be in order to evolve into this Pokémon species.",
  "held_item": "The item the evolving Pokémon species must be holding during the evolution trigger event to evolve into this Pokémon species.",
  "item": "The item required to cause evolution this into Pokémon species.",
  "known_move": "The move that must be known by the evolving Pokémon species during the evolution trigger event in order to evolve into this Pokémon species.",
  "known_move_type": "The evolving Pokémon species must know a move with this type during the evolution trigger event in order to evolve into this Pokémon species.",
  "location": "The location the evolution must be triggered at.",
  "min_affection": "The minimum required level of affection the evolving Pokémon species to evolve into this Pokémon species.    ",
  "min_beauty": "The minimum required level of beauty the evolving Pokémon species to evolve into this Pokémon species.",
  "min_happiness": "The minimum required level of happiness the evolving Pokémon species to evolve into this Pokémon species.",
  "min_level": "The minimum required level of the evolving Pokémon species to evolve into this Pokémon species.",
  "needs_overworld_rain": "Whether or not it must be raining in the overworld to cause evolution this Pokémon species.",
  "party_species": "The Pokémon species that must be in the players party in order for the evolving Pokémon species to evolve into this Pokémon species.",
  "party_type": "The player must have a Pokémon of this type in their party during the evolution trigger event in order for the evolving Pokémon species to evolve into this Pokémon species.",
  "relative_physical_stats": "The required relation between the Pokémon's Attack and Defense stats. 1 means Attack > Defense. 0 means Attack = Defense. -1 means Attack < Defense.",
  "time_of_day": "The required time of day. Day or night.",
  "trade_species": "Pokémon species for which this one must be traded.",
  "turn_upside_down": "Whether or not the 3DS needs to be turned upside-down as this Pokémon levels up."
};
const useRootStore = defineStore("root", {
  state: () => ({
    pageLimit: 65,
    pageRequestedCount: 0,
    pokemons: [],
    pokemonSpecies: [],
    pokemonTypes,
    pokemonStatsNaming,
    evolutionTriggerDescriptionByTriggerType
  }),
  getters: {
    pageOffset(state) {
      return state.pageLimit * state.pageRequestedCount;
    },
    isReady(state) {
      return state.pokemons.length > 0;
    },
    getPokemonById(state) {
      const pokemons = state.pokemons;
      return (pokemonId) => pokemons.filter((pokemon) => pokemon.id === pokemonId);
    }
  },
  actions: {
    async init() {
      if (this.isReady) {
        return;
      }
      {
        ({ default: fetch_ } = await import("cross-fetch"));
      }
      await this.addPokemons();
    },
    async addPokemons() {
      const url = "https://pokeapi.co/api/v2/pokemon";
      const query = `limit=${this.pageLimit}&offset=${this.pageOffset}`;
      {
        const { results: pokemons } = await (await fetch_(`${url}?${query}`)).json();
        this.pageRequestedCount++;
        const pokemonsWithData = await Promise.all(
          (await Promise.all(pokemons.map((pokemon) => fetch_(pokemon.url)))).map((response) => response.json())
        );
        this.pokemons = this.pokemons.concat(pokemonsWithData);
      }
    }
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$a = {
  __name: "Entry",
  __ssrInlineRender: true,
  props: ["pokemon"],
  setup(__props) {
    const props = __props;
    const root = useRootStore();
    const typeColors = reactive({
      a: "",
      b: ""
    });
    if (props.pokemon.types.length > 1) {
      typeColors.a = root.pokemonTypes[props.pokemon.types[0].type.name].color;
      typeColors.b = root.pokemonTypes[props.pokemon.types[1].type.name].color;
    } else {
      typeColors.a = root.pokemonTypes[props.pokemon.types[0].type.name].color;
      typeColors.b = null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      _push(ssrRenderComponent(_component_router_link, mergeProps({
        to: `/pokemon/${props.pokemon.id}`,
        block: "",
        relative: "",
        w: "100%",
        h: "0",
        pb: "125%",
        b: "1 solid #ccc rd-3px",
        overflow: "hidden",
        href: ""
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div absolute w="100%" h="100%" left="0" top="0" flex="~ col" bg="#eee"${_scopeId}><div class="thumbnail" w="65%" m-x="auto" mt="15%"${_scopeId}><div block w="100%" h="0" pb="100%" relative${_scopeId}><img absolute w="100%" h="100%" left="0" top="0"${ssrRenderAttr("src", props.pokemon.sprites.front_default)} alt=""${_scopeId}><div absolute w="100%" left="0" right="0" bottom="-4px" h="8px" flex justify="center"${_scopeId}><span w="10px" h="10px" style="${ssrRenderStyle({
              backgroundColor: typeColors.a,
              transform: `scaleX(${typeColors.b ? "" : "2"})`,
              borderRadius: typeColors.b ? "2px" : "1px"
            })}" relative${_scopeId}></span><span style="${ssrRenderStyle([
              typeColors.b ? null : { display: "none" },
              {
                backgroundColor: typeColors.b
              }
            ])}" w="10px" h="10px" b="rd-2px" relative${_scopeId}></span></div></div></div><div mt="auto"${_scopeId}><div mt="5%" block text="center #000" case-capital${_scopeId}>${ssrInterpolate(props.pokemon.name)}</div><div m="y-5%" block text="center 14px #aaa" font="semibold"${_scopeId}> # ${ssrInterpolate(("000" + props.pokemon.order).slice(-4))}</div></div></div>`);
          } else {
            return [
              createVNode("div", {
                absolute: "",
                w: "100%",
                h: "100%",
                left: "0",
                top: "0",
                flex: "~ col",
                bg: "#eee"
              }, [
                createVNode("div", {
                  class: "thumbnail",
                  w: "65%",
                  "m-x": "auto",
                  mt: "15%"
                }, [
                  createVNode("div", {
                    block: "",
                    w: "100%",
                    h: "0",
                    pb: "100%",
                    relative: ""
                  }, [
                    createVNode("img", {
                      absolute: "",
                      w: "100%",
                      h: "100%",
                      left: "0",
                      top: "0",
                      src: props.pokemon.sprites.front_default,
                      alt: ""
                    }, null, 8, ["src"]),
                    createVNode("div", {
                      absolute: "",
                      w: "100%",
                      left: "0",
                      right: "0",
                      bottom: "-4px",
                      h: "8px",
                      flex: "",
                      justify: "center"
                    }, [
                      createVNode(
                        "span",
                        {
                          w: "10px",
                          h: "10px",
                          style: {
                            backgroundColor: typeColors.a,
                            transform: `scaleX(${typeColors.b ? "" : "2"})`,
                            borderRadius: typeColors.b ? "2px" : "1px"
                          },
                          relative: ""
                        },
                        null,
                        4
                        /* STYLE */
                      ),
                      withDirectives(createVNode(
                        "span",
                        {
                          w: "10px",
                          h: "10px",
                          style: {
                            backgroundColor: typeColors.b
                          },
                          b: "rd-2px",
                          relative: ""
                        },
                        null,
                        4
                        /* STYLE */
                      ), [
                        [vShow, typeColors.b]
                      ])
                    ])
                  ])
                ]),
                createVNode("div", { mt: "auto" }, [
                  createVNode(
                    "div",
                    {
                      mt: "5%",
                      block: "",
                      text: "center #000",
                      "case-capital": ""
                    },
                    toDisplayString(props.pokemon.name),
                    1
                    /* TEXT */
                  ),
                  createVNode(
                    "div",
                    {
                      m: "y-5%",
                      block: "",
                      text: "center 14px #aaa",
                      font: "semibold"
                    },
                    " # " + toDisplayString(("000" + props.pokemon.order).slice(-4)),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ];
          }
        }),
        _: 1
        /* STABLE */
      }, _parent));
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Entry.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __unplugin_components_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/Entry.vue"]]);
const _sfc_main$9 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<header${ssrRenderAttrs(mergeProps({
    grow: "0",
    shrink: "0",
    h: "55px",
    bg: "#394AC5",
    flex: "",
    items: "center",
    justify: "center",
    text: "center #fff"
  }, _attrs))}> Lorem, ipsum dolor. </header>`);
}
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/HeaderBar.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __unplugin_components_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["ssrRender", _sfc_ssrRender$1], ["__file", "/Users/xuanmei/Documents/pokedex/src/components/HeaderBar.vue"]]);
class InifiniteScroll {
  constructor(props) {
    const {
      scrollerEl,
      scrollerItemEl
    } = props;
    Object.assign(this, {
      scrollerEl,
      scrollerItemEl
    });
    this.scope = effectScope();
    this.onResize();
  }
  run() {
    this.scope.run(() => {
      useInfiniteScroll(
        this.scrollerEl,
        () => {
          console.log("hit");
        },
        { distance: this.scrollerItemEl.value.offsetHeight / 3 }
      );
    });
  }
  stop() {
    this.scope.stop();
  }
  onResize() {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => {
        this.stop();
        this.scope = effectScope();
        console.log("new distance", this.scrollerItemEl.value.offsetHeight / 3);
        this.run();
      });
    }
  }
}
const App_vue_vue_type_style_index_0_scoped_7a7a37b1_lang = "";
const _sfc_main$8 = {
  __name: "App",
  __ssrInlineRender: true,
  setup(__props) {
    gsap.registerPlugin(Flip);
    const isSSRed = inject("isSSRed");
    const root = useRootStore();
    const clickedEntryRects = inject("clickedEntryRects");
    const scrollerEl = ref(null);
    const scrollerItemEl = ref(null);
    onMounted(() => {
      console.log(isSSRed);
      if (typeof window !== "undefined" && window.__INITIAL_STATE__.isSSRed) {
        console.log("entered");
        const infiniteScroll = new InifiniteScroll({
          scrollerEl,
          scrollerItemEl
        });
        console.log("distance", scrollerItemEl.value.offsetHeight / 3);
        infiniteScroll.run();
      }
    });
    function updateClickedEntryRects(event) {
      const outlineEl = event.currentTarget;
      const imageEl = event.currentTarget.querySelector(".thumbnail");
      clickedEntryRects.imageRect = imageEl.getBoundingClientRect();
      clickedEntryRects.outlineRect = outlineEl.getBoundingClientRect();
      clickedEntryRects.imageSrc = imageEl.querySelector("img").src;
      clickedEntryRects.initialImageEl = imageEl;
      clickedEntryRects.initialOutlineEl = outlineEl;
      isCurrentViewDetails.value = true;
    }
    const isCurrentViewDetails = ref(false);
    const scrollerItemElStyle = reactive({
      transition: "",
      transform: "",
      opacity: "1"
    });
    const scrollerItemElStyleShrunk = {
      transition: "transform .35s ease-in-out, opacity .3s",
      transform: "scale(.85)",
      opacity: "0"
    };
    let vClientInfiniteScroll = {};
    const originalImageEl = ref(null);
    const imageElFLIPState = reactive({
      width: null,
      height: null,
      top: null,
      left: null
    });
    const originalOutlineEl = ref(null);
    const outlineElFLIPState = reactive({
      width: null,
      height: null,
      top: null,
      left: null
    });
    const isImageTransitionEnd = ref(true);
    function onBeforeLeave(el) {
      if (el.id === "details") {
        const imageEl = el.querySelector("#imageEl");
        imageEl.style.visibility = "hidden";
        const outlineEl = el.querySelector("#outlineEl");
        outlineEl.style.visibility = "hidden";
        isImageTransitionEnd.value = false;
      }
    }
    function onLeave(el, done) {
      if (el.id === "details") {
        const detailsEl = el.querySelector("#detailsEl");
        detailsEl.style.visibility = "hidden";
        const imageEl = el.querySelector("#imageEl");
        const imageElBounds = imageEl.getBoundingClientRect();
        imageElFLIPState.width = imageElBounds.width + "px";
        imageElFLIPState.height = imageElBounds.height + "px";
        imageElFLIPState.top = imageElBounds.top + "px";
        imageElFLIPState.left = imageElBounds.left + "px";
        const outlineEl = el.querySelector("#outlineEl");
        const outlineElBounds = outlineEl.getBoundingClientRect();
        outlineElFLIPState.width = outlineElBounds.width + "px";
        outlineElFLIPState.height = outlineElBounds.height + "px";
        outlineElFLIPState.top = outlineElBounds.top + "px";
        outlineElFLIPState.left = outlineElBounds.left + "px";
        nextTick(() => {
          const originalImageElState = Flip.getState(originalImageEl.value);
          const originalOutlineElState = Flip.getState(originalOutlineEl.value);
          scrollerItemElStyle.transition = "";
          scrollerItemElStyle.transform = "";
          nextTick(() => {
            const imageElTargetBounds = clickedEntryRects.initialImageEl.getBoundingClientRect();
            const outlineElTargetBounds = clickedEntryRects.initialOutlineEl.getBoundingClientRect();
            scrollerItemElStyle.transform = scrollerItemElStyleShrunk.transform;
            nextTick(() => {
              scrollerItemElStyle.transition = scrollerItemElStyleShrunk.transition;
              nextTick(() => {
                scrollerItemElStyle.transform = "";
                imageElFLIPState.width = imageElTargetBounds.width + "px";
                imageElFLIPState.height = imageElTargetBounds.height + "px";
                imageElFLIPState.top = imageElTargetBounds.top + "px";
                imageElFLIPState.left = imageElTargetBounds.left + "px";
                outlineElFLIPState.width = outlineElTargetBounds.width + "px";
                outlineElFLIPState.height = outlineElTargetBounds.height + "px";
                outlineElFLIPState.top = outlineElTargetBounds.top + "px";
                outlineElFLIPState.left = outlineElTargetBounds.left + "px";
                nextTick(() => {
                  Flip.from(originalImageElState, {
                    duration: 0.525,
                    ease: "power3.out",
                    scale: true,
                    onComplete: () => {
                      isImageTransitionEnd.value = true;
                      done();
                    }
                  });
                  Flip.from(originalOutlineElState, {
                    duration: 0.35,
                    ease: "power4.inOut",
                    scale: true
                  });
                });
              });
            });
          });
        });
      }
    }
    ref("");
    ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HeaderBar = __unplugin_components_0$1;
      const _component_Entry = __unplugin_components_1$1;
      const _component_router_view = resolveComponent("router-view");
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_HeaderBar, null, null, _parent));
      _push(`<article top="55px" absolute bottom="0" left="0" w="100%" data-v-7a7a37b1><div overflow="y-scroll" h="100%" data-v-7a7a37b1><ul${ssrRenderAttrs(mergeProps({
        ref_key: "scrollerItemEl",
        ref: scrollerItemEl,
        class: "g0",
        style: {
          transformOrigin: scrollerEl.value ? `${scrollerEl.value.offsetWidth / 2}px ${scrollerEl.value.scrollTop + scrollerEl.value.offsetHeight / 2}px` : null,
          transition: scrollerItemElStyle.transition,
          transform: scrollerItemElStyle.transform,
          opacity: scrollerItemElStyle.opacity
        }
      }, ssrGetDirectiveProps(_ctx, unref(vClientInfiniteScroll))))} data-v-7a7a37b1><!--[-->`);
      ssrRenderList(unref(root).pokemons, (pokemon) => {
        _push(`<li class="g0-gc" data-v-7a7a37b1>`);
        _push(ssrRenderComponent(_component_Entry, {
          pokemon,
          onClick: ($event) => updateClickedEntryRects($event)
        }, null, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></div></article><!-- <router-view></router-view> -->`);
      _push(ssrRenderComponent(_component_router_view, null, {
        default: withCtx(({ Component }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(Component), null, null), _parent2, _scopeId);
          } else {
            return [
              createVNode(
                Transition,
                {
                  onBeforeLeave,
                  onLeave
                },
                {
                  default: withCtx(() => [
                    (openBlock(), createBlock(resolveDynamicComponent(Component)))
                  ]),
                  _: 2
                  /* DYNAMIC */
                },
                1024
                /* DYNAMIC_SLOTS */
              )
            ];
          }
        }),
        _: 1
        /* STABLE */
      }, _parent));
      if (!isImageTransitionEnd.value) {
        _push(`<div absolute z="50" style="${ssrRenderStyle({
          width: outlineElFLIPState.width,
          height: outlineElFLIPState.height,
          top: outlineElFLIPState.top,
          left: outlineElFLIPState.left
        })}" bg="#eee" data-v-7a7a37b1></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!isImageTransitionEnd.value) {
        _push(`<div absolute text="0" z="100" style="${ssrRenderStyle({
          width: imageElFLIPState.width,
          height: imageElFLIPState.height,
          top: imageElFLIPState.top,
          left: imageElFLIPState.left
        })}" data-v-7a7a37b1><img w="100%" h="100%"${ssrRenderAttr("src", unref(clickedEntryRects).imageSrc)} alt="" data-v-7a7a37b1></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const App = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-7a7a37b1"], ["__file", "/Users/xuanmei/Documents/pokedex/src/App.vue"]]);
const __uno = "";
const _sfc_main$7 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Home.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const Home = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender], ["__file", "/Users/xuanmei/Documents/pokedex/src/components/Home.vue"]]);
const pokemonSpecies = {
  promise: null
};
const pokemonEvolutionChain = {
  promise: null
};
const move = {
  promise: null
};
const _sfc_main$6 = {
  __name: "DefinitionColumnsWithHeading",
  __ssrInlineRender: true,
  props: ["moveUrl"],
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const root = useRootStore();
    const getMovePromise = async () => await (await fetch(props.moveUrl)).json();
    move.promise = getMovePromise();
    const moveDetails = ([__temp, __restore] = withAsyncContext(() => move.promise), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><!-- move type and effect text --><div flex="~ sm:row col" m="x-2"><!-- move type --><span shrink="0" flex self="sm:unset end" items="center" pr="sm:2"><span class="type-palette" w="90px" text="center 10px white" style="${ssrRenderStyle({
        backgroundColor: unref(root).pokemonTypes[unref(moveDetails).type.name].color
      })}" case-upper p="y-6px" b="rd-2px">${ssrInterpolate(unref(moveDetails).type.name)}</span></span><!-- effect text --><span grow="1" p="y-2 sm:x-2" text="12px #333 justify" leading="16px">${ssrInterpolate(unref(moveDetails).effect_entries[0].effect)}</span></div><!-- move main stats --><div flex justify="between" items="center" p="x-2 y-1"><div basis="33.33%" text="13px #aaa">PP</div><div basis="33.33%" text="center 13px #aaa">Power</div><div basis="33.33%" text="right 13px #aaa">Accuracy</div></div><div flex justify="between" items="center" p="x-2 y-1"><div basis="33.33%" text="12px">${ssrInterpolate(unref(moveDetails).pp)}</div><div basis="33.33%" text="center 12px">${ssrInterpolate(unref(moveDetails).power || "-")}</div><div basis="33.33%" text="right 12px">${ssrInterpolate(unref(moveDetails).accuracy || "-")}</div></div><!--]-->`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/DefinitionColumnsWithHeading.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __unplugin_components_4 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/DefinitionColumnsWithHeading.vue"]]);
const FlowDefinition_vue_vue_type_style_index_0_scoped_810d6c96_lang = "";
const imageSrcBaseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const imageSrcExtension = ".png";
const _sfc_main$5 = {
  __name: "FlowDefinition",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const root = useRootStore();
    const pokemonSpecies$1 = ([__temp, __restore] = withAsyncContext(() => pokemonSpecies.promise), __temp = await __temp, __restore(), __temp);
    let fromSpecies, toSpecies, evolutionFlow = [];
    const selfSpecies = {
      name: pokemonSpecies$1.name,
      imageSrc: imageSrcBaseUrl + pokemonSpecies$1.id + imageSrcExtension
    };
    if (!("url" in pokemonSpecies$1.evolution_chain))
      ;
    else {
      const getPokemonEvolutionChainPromise = async () => await (await fetch(pokemonSpecies$1.evolution_chain.url)).json();
      pokemonEvolutionChain.promise = getPokemonEvolutionChainPromise();
      const pokemonEvolutionChain$1 = ([__temp, __restore] = withAsyncContext(() => pokemonEvolutionChain.promise), __temp = await __temp, __restore(), __temp);
      const currentEvolutionChain = pokemonEvolutionChain$1.chain;
      if (!pokemonSpecies$1.evolves_from_species) {
        fromSpecies = null;
      } else {
        fromSpecies = {
          name: pokemonSpecies$1.evolves_from_species.name,
          imageSrc: imageSrcBaseUrl + pokemonSpecies$1.evolves_from_species.url.split("/").slice(-2, -1)[0] + imageSrcExtension
        };
        selfSpecies.details = findNextEvolutionChain(
          currentEvolutionChain,
          fromSpecies.name
        ).evolution_details;
        evolutionFlow.push([fromSpecies, selfSpecies]);
      }
      const nextEvolutionChain = findNextEvolutionChain(
        currentEvolutionChain,
        pokemonSpecies$1.name
      );
      if (!nextEvolutionChain) {
        toSpecies = null;
      } else {
        toSpecies = {
          name: nextEvolutionChain.species.name,
          imageSrc: imageSrcBaseUrl + nextEvolutionChain.species.url.split("/").slice(-2, -1)[0] + imageSrcExtension,
          details: nextEvolutionChain.evolution_details
        };
        evolutionFlow.push([selfSpecies, toSpecies]);
      }
    }
    const getEvolutionTriggers = (evolutionDetail) => {
      const result = [];
      for (const key in evolutionDetail) {
        if (key === "trigger") {
          continue;
        }
        if (evolutionDetail[key] !== null) {
          result.push({
            triggerTypeDescription: root.evolutionTriggerDescriptionByTriggerType[key],
            triggerValue: (() => {
              const value = evolutionDetail[key];
              if (value === true) {
                return "yes";
              } else if (value === false) {
                return "no";
              } else if (!value) {
                return "N/A";
              } else {
                return value;
              }
            })()
          });
        }
      }
      return result;
    };
    function findNextEvolutionChain(currentEvolutionChain, nameToMatch) {
      var _a;
      if (((_a = currentEvolutionChain == null ? void 0 : currentEvolutionChain.species) == null ? void 0 : _a.name) === nameToMatch) {
        return currentEvolutionChain.evolves_to[0];
      } else {
        return findNextEvolutionChain(currentEvolutionChain.evolves_to[0], nameToMatch);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderList(unref(evolutionFlow), (evolution) => {
        _push(`<div class="[&amp;:not(:first-of-type)]:mt-2.5%" data-v-810d6c96><!-- evolution species flow --><div flex justify="between" items="center" data-v-810d6c96><!-- from --><div w="27.25% sm:20%" flex="~ col" data-v-810d6c96><div w="100%" h="0" pb="100%" relative data-v-810d6c96><!-- <div
                        absolute
                        w="100%"
                        h="100%"
                        top="0"
                        left="0"
                        bg="#eee"></div> --><img absolute w="100%" h="100%" top="0" left="0"${ssrRenderAttr("src", evolution[0].imageSrc)} data-v-810d6c96></div><div text="center 12px sm:16px" data-v-810d6c96>${ssrInterpolate(evolution[0].name.charAt(0).toUpperCase() + evolution[0].name.slice(1))}</div></div><!-- arrow --><div class="evolution-arrow" data-v-810d6c96></div><!-- to --><div w="27.25% sm:20%" flex="~ col" data-v-810d6c96><div w="100%" h="0" pb="100%" relative data-v-810d6c96><!-- <div
                        absolute
                        w="100%"
                        h="100%"
                        top="0"
                        left="0"
                        bg="#eee"></div> --><img absolute w="100%" h="100%" top="0" left="0"${ssrRenderAttr("src", evolution[1].imageSrc)} data-v-810d6c96></div><div text="center 12px sm:16px" data-v-810d6c96>${ssrInterpolate(evolution[1].name.charAt(0).toUpperCase() + evolution[1].name.slice(1))}</div></div></div><!-- evolution trigger --><div data-v-810d6c96><!--[-->`);
        ssrRenderList(evolution[1].details, (evolutionDetail) => {
          var _a;
          _push(`<div sm:flex="~ nowrap row" flex="~ col" sm:items="center" b="1px solid #eee rd-3px" mt="2.5%" data-v-810d6c96><span pa="2" pb="0 sm:2" pr="2 sm:0" whitespace="nowrap" data-v-810d6c96>${ssrInterpolate((_a = evolutionDetail == null ? void 0 : evolutionDetail.trigger) == null ? void 0 : _a.name)}</span><div flex="~ col" data-v-810d6c96><!--[-->`);
          ssrRenderList(getEvolutionTriggers(evolutionDetail), (evolutionTrigger) => {
            _push(`<div data-v-810d6c96><div flex items="center" data-v-810d6c96><span grow="1" pa="2" text="12px #aaa justify" leading="16px" data-v-810d6c96>${ssrInterpolate(evolutionTrigger.triggerTypeDescription)}</span><span grow="0" shrink="0" w="65px" pa="2" text="12px right" data-v-810d6c96>${ssrInterpolate(evolutionTrigger.triggerValue)}</span></div></div>`);
          });
          _push(`<!--]--></div><!-- <span
                    pa="2"
                    text="12px #aaa justify"
                    leading="16px">Lorem ipsum dolor sit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, laboriosam?</span>
                <span 
                    pa="2"
                    text="12px">Lorem ipsum dolor sit. </span> --></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/FlowDefinition.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __unplugin_components_3 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-810d6c96"], ["__file", "/Users/xuanmei/Documents/pokedex/src/components/FlowDefinition.vue"]]);
const _sfc_main$4 = {
  __name: "SimpleStat",
  __ssrInlineRender: true,
  props: ["label", "value", "lookupField", "valueFontSize"],
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    let label, value;
    if (props.value) {
      ({ label, value } = props);
    } else {
      label = props.label;
      const pokemonSpecies$1 = ([__temp, __restore] = withAsyncContext(() => pokemonSpecies.promise), __temp = await __temp, __restore(), __temp);
      value = pokemonSpecies$1[props.lookupField];
    }
    if (props.lookupField === "gender_rate") {
      value = ((1 - value * 0.125) * 100).toFixed(1) + "% m, " + (value * 0.125 * 100).toFixed(1) + "% f";
    } else if (props.lookupField === "capture_rate") {
      value = (45 / 255 * 100).toFixed(2) + "%";
    } else if (props.lookupField === "hatch_counter") {
      value = 255 * ++value;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        "sm:basis": "50%",
        basis: "100%",
        leading: "8",
        flex: "",
        items: "center"
      }, _attrs))}><span w="42.5%" text="75%" font="semibold">${ssrInterpolate(unref(label))}:</span><span text="#000 14px" style="${ssrRenderStyle({ fontSize: props.valueFontSize || "" })}" sm:ml="unset" ml="auto">${ssrInterpolate(unref(value))}</span></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/SimpleStat.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __unplugin_components_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/SimpleStat.vue"]]);
const Loading_vue_vue_type_style_index_0_lang = "";
const _sfc_main$3 = {
  __name: "Loading",
  __ssrInlineRender: true,
  props: ["size"],
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "spinner",
        style: {
          width: props.size,
          height: props.size
        }
      }, _attrs))}><!--[-->`);
      ssrRenderList(12, (n) => {
        _push(`<div class="bar"></div>`);
      });
      _push(`<!--]--><!-- <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div> --></div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Loading.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __unplugin_components_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/Loading.vue"]]);
const _sfc_main$2 = {
  __name: "DefinitionTable",
  __ssrInlineRender: true,
  props: ["pokemonId"],
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const pokemonSpeciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${props.pokemonId}`;
    const getPokemonSpeciesPromise = async () => await (await fetch(pokemonSpeciesUrl)).json();
    pokemonSpecies.promise = getPokemonSpeciesPromise();
    const pokemonSpecies$1 = ([__temp, __restore] = withAsyncContext(() => pokemonSpecies.promise), __temp = await __temp, __restore(), __temp);
    const genus = pokemonSpecies$1.genera[7].genus;
    const flavorText = pokemonSpecies$1.flavor_text_entries[11].flavor_text;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        flex: "",
        b: "1px solid #ddd rd-3px"
      }, _attrs))}><p pa="12px" leading="6">${ssrInterpolate(unref(flavorText))}</p><p bg="#eee" flex justify="center" p="x-5%" ml="auto" items="center">${ssrInterpolate(unref(genus))}</p></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/DefinitionTable.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __unplugin_components_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/DefinitionTable.vue"]]);
const FilledDefinitionTable_vue_vue_type_style_index_0_scoped_15e7b414_lang = "";
const _sfc_main$1 = {
  __name: "FilledDefinitionTable",
  __ssrInlineRender: true,
  props: ["definitionGroupIds"],
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const root = useRootStore();
    const pokemonTypesByDamageRelation = ([__temp, __restore] = withAsyncContext(async () => Promise.all(
      ([__temp, __restore] = withAsyncContext(() => Promise.all(
        props.definitionGroupIds.map((id) => fetch(`https://pokeapi.co/api/v2/type/${id}`))
      )), __temp = await __temp, __restore(), __temp).map((response) => response.json())
    )), __temp = await __temp, __restore(), __temp).reduce((acc, value) => {
      const damageRelations = value.damage_relations;
      for (const damageRelationKey in damageRelations) {
        acc[damageRelationKey] = acc[damageRelationKey] || [];
        for (let i = 0; i < damageRelations[damageRelationKey].length; i++) {
          acc[damageRelationKey].push(damageRelations[damageRelationKey][i]);
        }
      }
      return acc;
    }, {});
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderList(unref(pokemonTypesByDamageRelation), (pokemonTypes2, damageRelation) => {
        _push(`<div flex class="r0" data-v-15e7b414>`);
        if (pokemonTypes2.length > 0) {
          _push(`<div bg="#eee" p="y-1" b="solid 1px #ddd" text="11px" w="75px" flex justify="center" items="center" shrink="0" data-v-15e7b414>${ssrInterpolate({
            "double_damage_from": "2x from",
            "double_damage_to": "2x to",
            "half_damage_from": ".5x from",
            "half_damage_to": ".5x to",
            "no_damage_from": "immune to",
            "no_damage_to": "ineffective to"
          }[damageRelation])}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div flex="~ wrap" data-v-15e7b414><!--[-->`);
        ssrRenderList(pokemonTypes2, (pokemonType) => {
          _push(`<span style="${ssrRenderStyle({
            backgroundColor: unref(root).pokemonTypes[pokemonType.name].color
          })}" p="y-6px" case-upper text="center white 10px" w="90px" flex justify="center" items="center" class="type-palette" data-v-15e7b414>${ssrInterpolate(pokemonType.name)}</span>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/FilledDefinitionTable.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const FilledDefinitionTable = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-15e7b414"], ["__file", "/Users/xuanmei/Documents/pokedex/src/components/FilledDefinitionTable.vue"]]);
const Details_vue_vue_type_style_index_0_lang = "";
const _sfc_main = {
  __name: "Details",
  __ssrInlineRender: true,
  setup(__props) {
    gsap.registerPlugin(Flip);
    const route = useRoute();
    const root = useRootStore();
    const pokemon = reactive(root.getPokemonById(+route.params.id)[0]);
    const { imageRect, outlineRect } = inject("clickedEntryRects");
    const originalImageEl = ref(null);
    const imageEl = ref(null);
    const detailsEl = ref(null);
    const originalOutlineEl = ref(null);
    const outlineEl = ref(null);
    const outlineElFLIPState = reactive({
      width: outlineRect.width + "px",
      height: outlineRect.height + "px",
      top: outlineRect.top + "px",
      left: outlineRect.left + "px"
    });
    const imageElFLIPState = reactive({
      width: imageRect.width + "px",
      height: imageRect.height + "px",
      top: imageRect.top + "px",
      left: imageRect.left + "px"
    });
    const isOutlineTransitionEnd = ref(false);
    const isImageTransitionEnd = ref(false);
    onMounted(() => {
      const originalOutlineElState = Flip.getState(originalOutlineEl.value);
      const finalOutlineElRect = outlineEl.value.getBoundingClientRect();
      outlineElFLIPState.width = finalOutlineElRect.width + "px";
      outlineElFLIPState.height = finalOutlineElRect.height + "px";
      outlineElFLIPState.top = finalOutlineElRect.top + "px";
      outlineElFLIPState.left = finalOutlineElRect.left + "px";
      outlineElFLIPState.backgroundColor = "#eee";
      const originalImageElState = Flip.getState(originalImageEl.value);
      const finalImageElRect = imageEl.value.getBoundingClientRect();
      imageElFLIPState.width = finalImageElRect.width + "px";
      imageElFLIPState.height = finalImageElRect.height + "px";
      imageElFLIPState.top = finalImageElRect.top + "px";
      imageElFLIPState.left = finalImageElRect.left + "px";
      nextTick(() => {
        Flip.from(originalOutlineElState, {
          duration: 0.5,
          ease: "power4.out",
          scale: true,
          onComplete: () => isOutlineTransitionEnd.value = true
        });
        gsap.from(detailsEl.value, {
          delay: 0.1,
          duration: 0.4,
          scale: 0.75,
          y: 25,
          autoAlpha: 0,
          ease: "power3.inOut"
        });
        Flip.from(originalImageElState, {
          // delay: .25,
          duration: 0.525,
          // ease: 'expo.out',
          ease: "power3.out",
          scale: true,
          onComplete: () => isImageTransitionEnd.value = true
        });
      });
    });
    const profileEntries = [
      { label: "Height", value: pokemon.height + " dm" },
      { label: "Weight", value: pokemon.weight + " hg" },
      { label: "Capture Rate", value: "" },
      // species
      { label: "Gender Rate", value: "" },
      // species
      { label: "Hatch Steps", value: "" },
      // species
      { label: "Abilities", value: pokemon.abilities.map((ability) => ability.ability.name).join(", ") }
    ];
    const moveDropdowns = ref(pokemon.moves.map((move2) => ({
      moveUrl: move2.move.url,
      isDroppedDown: false
    })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DefinitionTable = __unplugin_components_0;
      const _component_Loading = __unplugin_components_1;
      const _component_SimpleStat = __unplugin_components_2;
      const _component_FlowDefinition = __unplugin_components_3;
      const _component_DefinitionColumnsWithHeading = __unplugin_components_4;
      _push(`<article${ssrRenderAttrs(mergeProps({
        id: "details",
        absolute: "",
        w: "100%",
        h: "100%",
        top: "0",
        left: "0",
        z: "5",
        flex: "",
        overflow: "hidden"
      }, _attrs))}><!-- original outlineEl / bg --><!-- id="outlineEl" --><div z="1" absolute style="${ssrRenderStyle({
        width: outlineElFLIPState.width,
        height: outlineElFLIPState.height,
        top: outlineElFLIPState.top,
        left: outlineElFLIPState.left,
        backgroundColor: outlineElFLIPState.backgroundColor,
        visibility: isOutlineTransitionEnd.value ? "hidden" : "visible"
      })}"></div><!-- original imageEl --><div z="10" absolute style="${ssrRenderStyle({
        width: imageElFLIPState.width,
        height: imageElFLIPState.height,
        top: imageElFLIPState.top,
        left: imageElFLIPState.left
      })}"><img style="${ssrRenderStyle(!isImageTransitionEnd.value ? null : { display: "none" })}" w="100%" h="100%"${ssrRenderAttr("src", pokemon.sprites.front_default)} alt=""></div><!-- outlineEl / bg--><!-- invisible --><div id="outlineEl" style="${ssrRenderStyle({
        visibility: isOutlineTransitionEnd.value ? "visible" : "hidden"
      })}" absolute w="100%" h="100%" top="0" left="0" bg="#eee" z="1"></div><div id="detailsEl" relative z="2" mb="auto" mt="auto" h="85%" sm:h="90%" sm:grow="1" style="${ssrRenderStyle({
        overflowY: isImageTransitionEnd.value ? "scroll" : "hidden"
      })}" invisible><div w="82.5%" m="x-auto" flex="~ col" sm:max-w="512px" bg="white"><header bg="#ccc" pa="5" text="center #fff">${ssrInterpolate(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1))} <span ml="5" text="#fff"># ${ssrInterpolate(("000" + pokemon.order).slice(-4))}</span></header><section flex pa="5"><!-- image and type --><div w="28.25%" grow="0" flex="col"><!-- imageEl --><div id="imageEl" w="100%" h="0" pb="100%" relative><!-- <div
                                absolute
                                w="100%"
                                h="100%"
                                bg="#eee">
                            </div> --><img style="${ssrRenderStyle(isImageTransitionEnd.value ? null : { display: "none" })}" absolute w="100%" h="100%"${ssrRenderAttr("src", pokemon.sprites.front_default)} alt=""></div><!-- type --><div sm:flex="~ row" flex="~ col" mt="10%" w="100%" b="1px #ddd solid rd-3px"><div bg="#eee" p="x-4px y-4px" text="12px" flex justify="center" items="center"> Type </div><div grow="1" pa="5px" flex="~ col"><!--[-->`);
      ssrRenderList(pokemon.types, (type) => {
        _push(`<div class="type-palette sm:text-10px" style="${ssrRenderStyle({
          backgroundColor: unref(root).pokemonTypes[type.type.name].color
        })}" case-upper p="y-6px" text="center white 7px" b="rd-2px">${ssrInterpolate(type.type.name)}</div>`);
      });
      _push(`<!--]--></div></div></div><!-- main stats --><div grow="1" ml="7.25%"><div><!--[-->`);
      ssrRenderList(pokemon.stats, (stat) => {
        _push(`<div flex items="center" class="[&amp;:not(:first-child)]:mt-3.5%"><span grow="0" w="sm:25% 30%" text="sm:16px 12px">${ssrInterpolate(unref(root).pokemonStatsNaming[stat.stat.name])}</span><span class="stats-value" grow="1" b="1px #ddd solid rd-3px" pa="sm:4px 1px" ml="sm:12.5% 10%" bg="#eee" relative><span relative z="1" p="l-1.5" text="#fff sm:14px 12px">${ssrInterpolate(stat.base_stat)}</span><span absolute left="0" top="0" w="50%" style="${ssrRenderStyle({ width: `${stat.base_stat}%` })}" h="100%" bg="green"></span></span></div>`);
      });
      _push(`<!--]--></div></div></section><!-- genera and flavor text entry --><section p="x-5"><!-- <div
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
                    </div> -->`);
      ssrRenderSuspense(_push, {
        fallback: () => {
          _push(`<div pa="2" b="rd-3px 1px solid #eee" text="center #aaa" flex justify="center" items="center">`);
          _push(ssrRenderComponent(_component_Loading, { size: "25px" }, null, _parent));
          _push(`</div>`);
        },
        default: () => {
          _push(ssrRenderComponent(_component_DefinitionTable, {
            "pokemon-id": pokemon.id
          }, null, _parent));
        },
        _: 1
        /* STABLE */
      });
      _push(`</section><!-- profile --><section pa="5"><!-- profie header --><header bg="#ddd" p="x-5 y-2.5" mb="2.5">Profile </header><!-- profie stats --><div flex="~ wrap" p="x-5"><!--[-->`);
      ssrRenderList(profileEntries, (profileEntry) => {
        _push(`<!--[-->`);
        if (["height", "weight", "abilities"].indexOf(profileEntry.label.toLowerCase()) >= 0) {
          ssrRenderSuspense(_push, {
            default: () => {
              _push(ssrRenderComponent(_component_SimpleStat, {
                label: profileEntry.label,
                value: profileEntry.value,
                "value-font-size": profileEntry.label === "Abilities" ? "12px" : null
              }, null, _parent));
            },
            _: 2
            /* DYNAMIC */
          });
        } else {
          ssrRenderSuspense(_push, {
            fallback: () => {
              _push(`<div sm:basis="50%" basis="100%" leading="8" flex items="center"><span w="42.5%" text="75%" font="semibold">${ssrInterpolate(profileEntry.label)}</span><span sm:ml="unset" ml="auto" flex>`);
              _push(ssrRenderComponent(_component_Loading, { size: "25px" }, null, _parent));
              _push(`</span></div>`);
            },
            default: () => {
              _push(ssrRenderComponent(_component_SimpleStat, {
                label: profileEntry.label,
                "lookup-field": {
                  "Capture Rate": "capture_rate",
                  "Gender Rate": "gender_rate",
                  "Hatch Steps": "hatch_counter"
                }[profileEntry.label]
              }, null, _parent));
            },
            _: 2
            /* DYNAMIC */
          });
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--><!-- <div 
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
                        </div> --></div></section><!-- damage relations --><section p="x-5 b-5"><!-- damage relations header --><header bg="#ddd" p="x-5 y-2.5" mb="2.5">Damage Relations </header><div><!-- <div 
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
                        </div> -->`);
      ssrRenderSuspense(_push, {
        fallback: () => {
          _push(`<div flex justify="center">`);
          _push(ssrRenderComponent(_component_Loading, { size: "25px" }, null, _parent));
          _push(`</div>`);
        },
        default: () => {
          _push(ssrRenderComponent(FilledDefinitionTable, {
            "definition-group-ids": pokemon.types.map((type) => type.type.url.split("/").slice(-2, -1)[0])
          }, null, _parent));
        },
        _: 1
        /* STABLE */
      });
      _push(`</div></section><!-- evolutions --><section p="x-5 b-5"><!-- evolutions header --><header bg="#ddd" p="x-5 y-2.5" mb="2.5"> Evolutions </header>`);
      ssrRenderSuspense(_push, {
        fallback: () => {
          _push(`<div flex justify="center" p="t-4 b-2">`);
          _push(ssrRenderComponent(_component_Loading, { size: "25px" }, null, _parent));
          _push(`</div>`);
        },
        default: () => {
          _push(ssrRenderComponent(_component_FlowDefinition, null, null, _parent));
        },
        _: 1
        /* STABLE */
      });
      _push(`</section><!-- moves --><section p="x-5 b-5"><!-- moves header --><header bg="#ddd" p="x-5 y-2.5" mb="2.5"> Moves </header><!--[-->`);
      ssrRenderList(pokemon.moves, (move2, index) => {
        _push(`<a block b="1px solid #ddd rd-3px" href="#" class="[&amp;:not(:first-of-type)]:mt-2.5%"><!-- move entry --><div p="x-2 y-2" flex items="center"><div style="${ssrRenderStyle({
          transition: "transform .35s, color .35s",
          transform: `rotate(${moveDropdowns.value[index].isDroppedDown ? "-45deg" : 0})`,
          color: moveDropdowns.value[index].isDroppedDown ? "#ccc" : ""
        })}">+</div><div ml="auto">${ssrInterpolate(move2.move.name)}</div></div><!-- move details -->`);
        if (moveDropdowns.value[index].isDroppedDown) {
          _push(`<div>`);
          ssrRenderSuspense(_push, {
            fallback: () => {
              _push(`<div flex justify="center" pb="4">`);
              _push(ssrRenderComponent(_component_Loading, { size: "25px" }, null, _parent));
              _push(`</div>`);
            },
            default: () => {
              _push(ssrRenderComponent(_component_DefinitionColumnsWithHeading, {
                "move-url": moveDropdowns.value[index].moveUrl
              }, null, _parent));
            },
            _: 2
            /* DYNAMIC */
          });
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</a>`);
      });
      _push(`<!--]--></section></div></div></article>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Details.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Details = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/xuanmei/Documents/pokedex/src/components/Details.vue"]]);
const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/pokemon/:id",
    component: Details
  }
];
const createApp = ViteSSG(
  App,
  { routes },
  ({ app, initialState, router }) => {
    app.provide("clickedEntryRects", {
      imageRect: null,
      outlineRect: null,
      imageSrc: null,
      initialImageEl: null,
      initialOutlineEl: null
    });
    const pinia = createPinia();
    app.use(pinia);
    {
      initialState.pinia = pinia.state.value;
      initialState.isSSRed = true;
    }
    router.beforeEach(async (_, __, next) => {
      const store = useRootStore(pinia);
      await store.init();
      next();
    });
  }
);
export {
  createApp
};
