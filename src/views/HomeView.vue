<script setup>
import bt from 'bluetooth-terminal'
let terminal = new bt()

function connectClick() {
  terminal.connect().then(() => {
    alert(terminal.getDeviceName())
  })
}
</script>

<template>
  <main>
    <button class="btn" @click="connectClick">Connect</button>
  </main>
</template>
