<script setup>
import { computed, ref } from 'vue'
import bt from 'bluetooth-terminal'

import NavBar from '../components/NavBar.vue'
import BaseControl from '../components/BaseControl.vue'

import { useControlStore } from '../stores/control.js'

let terminal = new bt()

const store = useControlStore()
const deviceName = ref('')
const log = ref('')
const logEl = ref(null)
const consoleInput = ref('')
const showTerminal = ref('')

const connState = ref('idle')

const writeLog = (data) => {
    log.value += "\n" + data
    window.ampas = logEl.value
    setTimeout(() => {
        logEl.value.scrollTop = logEl.value.scrollHeight
    }, 50)
}

terminal.receive = (data) => writeLog("< " + data)

const consoleInputEnter = (data) => {
    // if data not null or undefined then use it instead
    if (data ===  undefined || data === null || typeof data !== 'string') {
        data = consoleInput.value
    }
    
    writeLog('> ' + data)
    terminal.send(data)
        .catch((e) => { writeLog('err: ' + e) })
        .finally(() => consoleInput.value = '')
}

const connectClick = () => {
    navigator.permissions.query({ name: "bluetooth" }).then((m) => {
        alert(m)
    }).catch(() => { })

    connState.value = 'connecting'
    terminal.connect()
        .then((t) => {
            deviceName.value = terminal.getDeviceName() ?
                terminal.getDeviceName() : deviceName.value;
            connState.value = 'connected'
            store.setSendHandler(consoleInputEnter)
        })
        .catch((e) => {
            connState.value = 'idle'
            alert(e)
            writeLog(e)
        })
}

</script>

<template>
    <div class="container max-w-md mx-auto h-full flex flex-col">
        <NavBar @click="showTerminal = !showTerminal" />
        <main class="my-4 px-2 md:px-0 flex-grow">
            <button class="btn btn-sm me-2" @click="connectClick">Connect</button>
            <span v-if="connState == 'connecting'" class="loading loading-dots loading-md"></span>
            <span v-if="connState == 'connected'">Connected to: <b>{{ deviceName }}</b></span>
            <BaseControl />
        </main>
        <div v-if="showTerminal" class="bg-base-300 w-full px-4 py-0 font-mono border-t border-t-current">
            <pre ref="logEl" class="text-sm max-h-80 h-80 overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                <code>{{ log }}</code>
            </pre>
            <form class="flex py-2 items-center" @submit.prevent="consoleInputEnter">
                <span>&gt;&nbsp;</span>
                <input v-model="consoleInput" class="bg-transparent outline-none border-none p-0 w-full input-sm">
            </form>
        </div>
    </div>
</template>

<style>
html,
body,
#app {
    height: 100%;
}
</style>
