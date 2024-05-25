<script setup>
import { ref } from 'vue'
import { useControlStore } from '../stores/control.js'

const store = useControlStore()
const modalEl = ref(null)
const newInputName = ref('')
const newInputCommandOn = ref('')
const newInputCommandOff = ref('')

const formSubmit = () => {
    store.addSwitch({
        name: newInputName.value,
        commandOn: newInputCommandOn.value,
        commandOff: newInputCommandOff.value,
    })
    newInputName.value = ''
    newInputCommandOn.value = ''
    newInputCommandOff.value = ''
    modalEl.value.close()
}
</script>
<template>
    <div class="flex">
        <button class="btn btn-sm ms-auto" @click="modalEl.showModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
        </button>
        <button @click="store.cleanCurrentDevice"
            class="ms-2 btn btn-sm bg-red-400 text-gray-800 hover:bg-red-600">Clean Saved</button>
    </div>
    <dialog ref="modalEl" class="modal">
        <div class="modal-box max-w-xs">
            <h3 class="font-bold text-lg">Add Control</h3>
            <form class="mt-2" @submit.prevent="formSubmit">
                <input v-model="newInputName" type="text" placeholder="Control Name"
                    class="input input-sm input-bordered w-full max-w-xs mb-2" />
                <input v-model="newInputCommandOn" type="text" placeholder="Command On"
                    class="input input-sm input-bordered w-full max-w-xs mb-2" />
                <input v-model="newInputCommandOff" type="text" placeholder="Command Off"
                    class="input input-sm input-bordered w-full max-w-xs mb-2" />
                <button class="flex ms-auto">Save</button>
            </form>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
