<script lang="ts" setup>
import { onMounted } from "vue";
import HelpOverlay from "~/components/HelpOverlay.vue";
import Search from "~/components/Search.vue";

const openWebsite = () => {
  window.open("https://egg.waradu.dev/", "_blank");
};

onMounted(() => {
  document.querySelectorAll(".letter").forEach((letter) => {
    letter.addEventListener("mouseenter", () => {
      if (!letter.classList.contains("animate")) {
        letter.classList.add("animate");
        letter.addEventListener(
          "animationend",
          () => {
            letter.classList.remove("animate");
          },
          { once: true }
        );
      }
    });
  });
});
</script>

<template>
  <main>
    <div class="letters">
      <div class="letter">E</div>
      <div class="letter">g</div>
      <div class="letter">g</div>
      <div class="letter">c</div>
      <div class="letter">e</div>
      <div class="letter">l</div>
      <div class="letter">l</div>
      <div class="letter">e</div>
      <div class="letter">n</div>
      <div class="letter">t</div>
    </div>
    <Search />
  </main>
  <HelpOverlay />
  <div
    id="settings-open"
    class="logo"
    title="Eggcellent Website"
    @click="openWebsite"
  ></div>
</template>

<style lang="scss">
@use "~/assets/styles/colors";
@import url("~/assets/styles/global.scss");

main {
  width: 700px;
  height: 537px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;

  .letters {
    position: absolute;
    top: -80px;

    display: flex;
    font-size: 40px;
    font-weight: 700;
    color: colors.$bg;
    filter: brightness(150%);
    transition: color 0.2s;

    .letter {
      &.animate {
        animation: jump 1.5s 1 alternate forwards
          cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }
  }
}

.logo {
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 40px;
  height: 40px;
  transition: 0.2s;
  cursor: pointer;
  background: url("~/assets/images/512_Outlined.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;

  &:hover {
    background: url("~/assets/images/512.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    box-shadow: colors.$popup-shadow;
  }
}

@keyframes jump {
  0%,
  to {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }

  25%,
  75% {
    text-shadow: -5px 2px 2px rgba(0, 0, 0, 0.15), 0 5px 12px rgba(0, 0, 0, 0.15);
    transform: matrix(1.1, 0, 0, 0.8, 0, 0);
  }

  50% {
    transform: matrix(0.8, 0, 0, 1.2, 0, 0) translateY(-10px);
    text-shadow: -20px 10px 10px rgba(0, 0, 0, 0.15),
      0 20px 50px rgba(0, 0, 0, 0.15);
  }
}
</style>
