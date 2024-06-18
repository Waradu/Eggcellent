<template>
  <div class="search-container">
    <div class="search-bar">
      <div class="icon material-symbols-rounded">search</div>
      <div class="before" id="before"></div>
      <input
        type="text"
        class="input"
        placeholder="Search"
        id="search"
        autocomplete="off"
      />
      <div class="send material-symbols-rounded" id="send">send</div>
    </div>
    <hr />
    <div class="search-results" id="results">
      <template v-for="(result, index) in results as w.Widgets[]">
        <Result :result="result" :index="index" />
      </template>
    </div>
    <hr />
    <div class="footer">
      <div class="key">
        <div class="button material-symbols-rounded" id="au">arrow_upward</div>
        <div class="button material-symbols-rounded" id="ad">
          arrow_downward
        </div>
        <div class="text">Navigate</div>
      </div>
      <div class="key">
        <div class="button material-symbols-rounded" id="en">shift</div>
        <div class="button material-symbols-rounded" id="en">
          keyboard_return
        </div>
        <div class="text">Options</div>
      </div>
      <div class="key">
        <div class="button material-symbols-rounded" id="en">
          keyboard_return
        </div>
        <div class="text">Use</div>
      </div>
      <div class="rcount" id="rcount">0/0</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Result from "./Result.vue";
import { ref } from "vue";
import * as w from "~/utils/widget";

const results = ref<w.Widgets[]>([]);

const test = w
  .widget()
  .title("Test")
  .description("Description is (sch)loooooooong")
  .icon("toolbar")
  .image("star")
  .type("test");

results.value.push(test);
</script>

<style lang="scss">
@use "~/assets/styles/colors";

.search-container {
  background-color: colors.$popup-bg-color;
  background-size: cover;
  border: colors.$popup-border;
  box-shadow: colors.$popup-shadow;
  width: 700px;
  padding: 10px;
  border-radius: 8px;
  height: max-content;
  transition: 0.2s;
  scale: 0.8;
  opacity: 0.2;
  animation: show 0.3s cubic-bezier(0.7, 0, 0.7, 1) 0s 1 forwards;

  .search-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    .send,
    .icon {
      user-select: none;
      cursor: pointer;
      color: colors.$icon-color;
    }

    .before {
      color: colors.$text-color-dark;
      margin-right: 5px;
      margin-left: 10px;
      font-family: Inter;
      font-size: 18px;
      height: 100%;
      width: max-content;
      white-space: nowrap;
    }

    .input {
      width: calc(100% - 40px);
      padding-right: 20px;
      color: colors.$text-color;
      background: transparent;
      border: none;
      outline: none;
      font-family: Inter;
      font-size: 18px;
      caret-color: colors.$text-color;

      &::placeholder {
        color: colors.$text-color-dark;
      }
    }
  }

  hr {
    border: none;
    border: 1px solid colors.$border-color;
    border-radius: 2px;
    outline: none;
    margin: 5px;
    width: calc(100% - 20px);
    margin-inline: 10px;
  }

  .search-results {
    width: calc(100% - 20px);
    margin: 10px;
    user-select: none;
    transition: 0.1s;

    .result {
      display: flex;
      width: 100%;
      padding-inline: 10px;
      height: 50px;
      border-radius: 6px;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: 0.2s;

      &.selected-result,
      &:hover {
        background-color: colors.$element-hover;
      }

      .icon {
        height: 25px !important;
        width: 25px !important;
        border-radius: 2px;

        border-radius: 4px;

        display: grid;
        place-items: center;
        text-transform: uppercase;

        color: colors.$icon-color;
        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24 !important;

        &.rotate {
          rotate: 0deg;
          animation: rotate 2s linear infinite;
        }
      }

      .text {
        font-size: 16px;
        width: calc(100% - 5px);
        overflow: hidden;
        margin-right: 5px;
        color: colors.$text-color-light;
        text-transform: capitalize;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .desc {
          font-size: 14px;
          overflow: hidden;
          text-transform: lowercase;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: colors.$text-color;
          font-weight: 100;
        }
      }

      &.extension {
        .text {
          .desc {
            text-transform: none;
          }
        }
      }

      .qa-icon {
        height: 30px !important;
        aspect-ratio: 1 / 1;

        color: colors.$icon-color;

        display: grid;
        place-items: center;

        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24 !important;

        &.favorite {
          color: colors.$egg;
        }
      }

      &.always-select {
        background-color: colors.$danger-light;

        .qa-icon {
          color: colors.$icon-color;
        }

        .text {
          color: colors.$text-color-light;
          .desc {
            color: colors.$text-color;
          }
        }
      }

      &.blue {
        background-color: colors.$primary-light;

        .qa-icon {
          color: colors.$icon-color;
        }

        .text {
          color: colors.$text-color-light;
          .desc {
            color: colors.$text-color;
          }
        }
      }
    }
  }

  .footer {
    display: grid;
    grid-template-columns: repeat(4, calc(100% / 4));
    width: calc(100% - 20px);
    margin: 15px;
    user-select: none;
    margin-bottom: 5px;
    margin-inline: 10px;
    align-items: center;
    justify-content: center;
    color: colors.$icon-color;

    .rcount {
      justify-self: end;
      font-size: 14px;
      color: colors.$text-color-dark;
    }

    .key {
      display: flex;
      gap: 5px;
      align-items: center;

      .text {
        font-size: 13px;
        font-weight: 300;
      }
      .button {
        align-items: center;
        background: colors.$button-color;
        border: 0;
        border-radius: 3px;
        border: colors.$button-border;
        box-shadow: colors.$button-shadow !important;
        color: colors.$text-color-dark;
        display: flex;
        justify-content: center;
        margin-right: 4px;
        padding: 4px;
        box-sizing: border-box;
        width: max-content;
        position: relative;
        font-size: 14px;
        transition: 0.2s;
      }
    }
  }
}
</style>
