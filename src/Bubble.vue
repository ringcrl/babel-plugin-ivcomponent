<style>
.bubble {
  position: absolute;
  display: table;
}
</style>

<template>
  <div
    class="bubble"
    v-show="visible"
    @click="onClick"
    :style="{
      top: y + '%',
      left: x + '%',
      width: width + '%',
      height: height + '%',
    }"
  ></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    action: {
      type: Object,
      default: function _default() {
        return {};
      },
    },
  },
  mounted() {
    this.bindListener();
  },
  methods: {
    bindListener() {
      this.bridge.on('videoTimeUpdate', (time) => {
        if (time >= this.startTime) {
          this.show();
        } else {
          this.hide();
        }
      });
    },
    onClick() {
      console.log('on bubble click!');
    },
  },
};
</script>
