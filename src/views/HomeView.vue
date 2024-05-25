<script setup>
import { computed, ref } from 'vue'
import NavBar from '../components/NavBar.vue'
import bt from 'bluetooth-terminal'
let terminal = new bt()

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
        })
        .catch((e) => {
            connState.value = 'idle'
            alert(e)
            writeLog(e)
        })
}

const consoleInputEnter = () => {
    writeLog('> ' + consoleInput.value)
    terminal.send(consoleInput.value)
        .catch((e) => { writeLog('err: ' + e) })
        .finally(() => consoleInput.value = '')
}

</script>

<template>
    <div class="container max-w-md mx-auto h-full flex flex-col">
        <NavBar @click="showTerminal = !showTerminal" />
        <main class="my-4 px-2 md:px-0 flex-grow">
            <button class="btn btn-sm me-2" @click="connectClick">Connect</button>
            <span v-if="connState == 'connecting'" class="loading loading-dots loading-md"></span>
            <span v-if="connState == 'connected'">Connected to: <b>{{ deviceName }}</b></span>
        </main>
        <div v-if="showTerminal" class="bg-base-300 w-full px-4 py-0 font-mono border-t border-t-current">
            <pre ref="logEl" class="text-sm max-h-20 h-20 overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                {{ log }}
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
