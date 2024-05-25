<script setup>
import ControlBar from './ControlBar.vue'
import { useControlStore } from '../stores/control.js'
const store = useControlStore()

</script>
<template>
    <div class="mt-2">
        <ControlBar />
    </div>
    <div class="grid grid-cols-2 gap-4 mt-4">
        <div v-for="s in store.switches" class="card bg-base-300">
            <div class="card-body p-3 py-4">
                <div class="card-title select-none">{{ s.name }}</div>
                <div class="flex gap-x-2">
                    <button @click="store.switchOff(s)" class="flex-auto btn btn-sm">Off</button>
                    <button @click="store.switchOn(s)" class="flex-auto btn btn-sm">On</button>
                </div>
            </div>
        </div>
    </div>
</template>
