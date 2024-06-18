<template>
  <div class="result" :class="result.type()" :data-index="index">
    <img
      :src="
        result.image() as string !== ''
          ? result.image() as string
          : '~/assets/images/transparent.png'
            "
      alt=""
      class="icon"
      v-if="result.useImage()"
    />
    <div class="icon material-symbols-rounded" v-else>{{ result.image() }}</div>
    <div class="text">
      <span>{{ result.title() }}</span>
      <div class="desc">{{ result.description() }}</div>
    </div>
    <div class="qa-icon material-symbols-rounded">{{ result.icon() }}</div>
  </div>
</template>

<script lang="ts" setup>
import { Widgets } from "@/utils/widget";

defineProps({
  result: {
    type: Object as () => Widgets,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
</script>
