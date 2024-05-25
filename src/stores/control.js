import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const LOCAL_STORAGE_KEY = "controls"

const formatDeviceName = (name) => name.replaceAll(' ', '_')

const getSavedSwitches = (deviceName) => {
    const key = LOCAL_STORAGE_KEY + "." + formatDeviceName(deviceName)
    const items = JSON.parse(localStorage.getItem(key))
    return items ? items : [];
}

const saveSwitches = (deviceName, switches) => {
    const key = LOCAL_STORAGE_KEY + "." + formatDeviceName(deviceName)
    localStorage.setItem(key, JSON.stringify(switches))
}

export const useControlStore = defineStore('control', () => {
    const currentDeviceName = ref('')
    const syncSwitches = ref('') // this used to trigger computed update below
    const switches = computed(() => getSavedSwitches(currentDeviceName.value, syncSwitches.value))

    const addSwitch = (data) => {
        const oldSwitches = getSavedSwitches(currentDeviceName.value)
        oldSwitches.push(data)
        saveSwitches(currentDeviceName.value, oldSwitches)
        syncSwitches.value = new Date()
    }
    const cleanCurrentDevice = () => {
        saveSwitches(currentDeviceName.value, [])
        syncSwitches.value = new Date()
    }

    const sendHandler = ref(() => { console.log("send handler unset") })
    const setSendHandler = (fn) => sendHandler.value = fn
    const setCurrentDeviceName = (deviceName) => currentDeviceName.value = deviceName

    const switchOn = (sw) => {
        sendHandler.value(sw.commandOn)
    }
    const switchOff = (sw) => {
        sendHandler.value(sw.commandOff)
    }

    return {
        currentDeviceName,
        switches,
        addSwitch,
        cleanCurrentDevice,
        setCurrentDeviceName,
        setSendHandler,
        switchOn,
        switchOff,
    }
})
