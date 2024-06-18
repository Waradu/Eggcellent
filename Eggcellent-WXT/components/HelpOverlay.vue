<template>
  <div class="help-overlay">
    <div ref="arrows" class="arrows" @click="opend = !opend">
      <div class="arrow"></div>
      <div class="arrow"></div>
    </div>
    <div ref="help" class="help" :class="{ closed: !opend }">
      <div class="header">
        <div class="title">Eggcellent - Help</div>
        <div class="material-symbols-rounded close">question_mark</div>
      </div>
      <div class="group">
        <div class="group-header">
          <div class="text">Quick Keys</div>
          <div class="desc">
            <div class="key">Key</div>
            then
            <div class="key">Space</div>
            or
            <div class="key">Tab</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Filter Tabs</div>
          <div class="desc">
            Only
            <div class="key">Space</div>
            or
            <div class="key">Tab</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Filter Bookmarks</div>
          <div class="desc">
            <div class="key">.</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Filter Browsing History</div>
          <div class="desc">
            <div class="key">,</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Filter Extensions</div>
          <div class="desc">
            <div class="key">-</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Command</div>
          <div class="desc">
            <div class="key">&gt;</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Solve Math Term</div>
          <div class="desc">
            <div class="key">=</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Settings</div>
          <div class="desc">
            <div class="key">:</div>
          </div>
        </div>
        <div class="group-item" hidden>
          <div class="text">Manage Todos</div>
          <div class="desc">
            <div class="key">&lt;</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Links</div>
          <div class="desc">
            <div class="key">+</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Speedtest</div>
          <div class="desc">
            <div class="key">$</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Hex Code Preview</div>
          <div class="desc">
            <div class="key">#</div>
          </div>
        </div>
      </div>
      <div class="group">
        <div class="group-header">
          <div class="text">Keybinds</div>
          <div class="desc">All keybinds</div>
        </div>

        <div class="group-item">
          <div class="text">Up</div>
          <div class="desc">
            <div class="key material-symbols-rounded">arrow_upward</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Down</div>
          <div class="desc">
            <div class="key material-symbols-rounded">arrow_downward</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Unselect</div>
          <div class="desc">
            <div class="key">ESC</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Use</div>
          <div class="desc">
            <div class="key material-symbols-rounded">keyboard_return</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Options</div>
          <div class="desc">
            <div class="key material-symbols-rounded">shift</div>
            <div class="key material-symbols-rounded">keyboard_return</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Open Help</div>
          <div class="desc">
            <div class="key">Alt</div>
            <div class="key">?</div>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Open Search Page</div>
          <div class="desc">
            <div class="key">Alt</div>
            <div class="key">S</div>
            or
            <div class="key">CUSTOM</div>
          </div>
        </div>
      </div>
      <div class="group">
        <div class="group-header">
          <div class="text">Others + FAQ</div>
          <div class="desc">Everything else including FAQ</div>
        </div>

        <div class="group-item">
          <div class="text">Contact</div>
          <div class="desc">
            Join my <a href="https://discord.gg/W6k8eMb9gB">Discord</a>
          </div>
        </div>
        <div class="group-item">
          <div class="text">Why Not On Chrome Store</div>
          <div class="desc">Minimum age 18</div>
        </div>
        <div class="group-item">
          <div class="text">Privacy</div>
          <div class="desc">We do not collect any data</div>
        </div>
        <div class="group-item">
          <div class="text">Source Code</div>
          <div class="desc">
            On <a href="https://github.com/Waradu/Eggcellent">Github</a>
          </div>
        </div>
        <div class="group-item">
          <div class="text">How Can I Donate</div>
          <div class="desc">
            Ask me on <a href="https://discord.gg/W6k8eMb9gB">Discord</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const opend = ref(false);

const arrows = ref<HTMLElement | null>(null);
const help = ref<HTMLElement | null>(null);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("help") === "true") {
    opend.value = true;
  }

  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "?") {
      opend.value = !opend.value;
    }
  });

  document.body.style.transition = "width .2s ease-in-out, background .2s";
  if (help.value && arrows.value) {
    help.value.style.transition = "right 0.2s ease-in-out, filter .2s";
    arrows.value.style.transition = ".2s ease-in-out";
  }
});
</script>

<style lang="scss">
@use "~/assets/styles/colors";

.help-overlay {
  .help {
    position: absolute;
    z-index: 999;
    background-color: colors.$popup-background;
    box-shadow: colors.$popup-shadow;
    border: colors.$popup-border;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 20px;
    width: 400px;
    right: 20px;
    bottom: 20px;
    border-radius: 8px;
    overflow-y: auto;

    &.closed {
      right: -420px;
    }

    .header {
      display: flex;
      padding: 20px;
      width: 100%;
      justify-content: space-between;
      position: sticky;
      top: 0;
      background-image: linear-gradient(
        to bottom,
        colors.$popup-background,
        colors.$popup-background 90%,
        transparent
      );
      z-index: 100;

      .title {
        color: colors.$text-color-light;
        font-family: Inter;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
      }

      .close {
        color: colors.$text-color-dark;
        font-size: 20px;
      }
    }

    .group {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;
      margin: 10px;
      margin-top: 0;

      .group-header {
        display: flex;
        padding: 10px;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;

        .text {
          color: colors.$text-color;
          font-family: Inter;
          font-size: 15px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
        }

        .desc {
          color: colors.$text-color-dark;
          font-family: Inter;
          font-size: 13px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          display: flex;
          align-items: center;
          gap: 5px;

          .key {
            align-items: center;
            background: colors.$button-color;
            border: 0;
            border-radius: 3px;
            border: colors.$button-border;
            box-shadow: colors.$button-shadow;
            color: colors.$text-color-dark;
            display: flex;
            justify-content: center;
            padding: 4px;
            padding-top: 3px;
            padding-bottom: 3px;
            box-sizing: border-box;
            width: max-content;
            position: relative;
            font-size: 11px;
            transition: 0.2s;
            font-weight: 500;
            height: 22px;
          }
        }
      }

      .group-item {
        display: flex;
        padding: 5px 10px;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;
        height: 31px;

        .text {
          color: colors.$text-color-dark;
          font-family: Inter;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
        }

        .desc {
          color: colors.$text-color-dark;
          font-family: Inter;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          display: flex;
          align-items: center;
          gap: 5px;

          .key {
            align-items: center;
            background: colors.$button-color;
            border: 0;
            border-radius: 3px;
            border: colors.$button-border;
            box-shadow: colors.$button-shadow;
            color: colors.$text-color-dark;
            display: flex;
            justify-content: center;
            padding: 4px;
            padding-top: 3px;
            padding-bottom: 3px;
            box-sizing: border-box;
            width: max-content;
            position: relative;
            font-size: 11px;
            transition: 0.2s;
            font-weight: 500;
            height: 21px;
          }

          a {
            color: colors.$text-color-dark;
            transition: 0.2s;

            &:hover {
              color: colors.$text-color;
            }
          }
        }
      }
    }
  }

  .arrows {
    position: absolute;
    right: 430px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    padding: 15px;

    .arrow {
      z-index: 999;
      background-color: colors.$border-color;
      width: 5px;
      height: 14px;
      border-radius: 10px;
      transition: 0.2s;

      margin-bottom: -2px;
      transform-origin: center bottom;

      &:last-child {
        margin-bottom: 0px;
        margin-top: -2px;
        transform-origin: center top;
      }
    }

    &:hover {
      .arrow {
        background-color: colors.$icon-color;
        margin-right: -3px;
        rotate: -15deg;

        &:last-child {
          rotate: 15deg;
        }
      }
    }
  }

  &:has(.closed) {
    .arrows {
      right: 10px;

      .arrow {
        margin-right: 3px;
        rotate: 15deg;

        &:last-child {
          rotate: -15deg;
        }
      }
    }
  }

  &:has(.arrows:hover) {
    .help {
      filter: brightness(80%);
    }
  }
}
</style>
