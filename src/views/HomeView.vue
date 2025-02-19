<script setup>
import { ref } from 'vue'

const logs = ref([])
const terminalInput = ref('')
const load = ref(false)
const server = ref(null)
const characteristic = ref(null)

async function handleSubmit() {
  const command = terminalInput.value.trim()
  logs.value.push(`bledash~% ${command}`)

  if (command === 'connect') {
    try {
      load.value = true
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
      })

      logs.value.push('Setup connection...')
      logs.value.push('Connecting...')

      server.value = await device.gatt.connect()
      logs.value.push('Connected')

      // Automatically fetch the primary service and characteristic
      const service = await server.value.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
      logs.value.push('Service found')

      characteristic.value = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e')
      logs.value.push('Characteristic found')

      // Send "showconfig" command immediately after connection
      const encoder = new TextEncoder()
      await characteristic.value.writeValue(encoder.encode('showconfig\n'))
      logs.value.push('Sent command: showconfig')

      // Enable notifications on response characteristic (if applicable)
      const responseCharacteristic = await service.getCharacteristic(
        '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
      )
      await responseCharacteristic.startNotifications()

      responseCharacteristic.addEventListener('characteristicvaluechanged', (ev) => {
        const value = new TextDecoder().decode(ev.target.value)
        logs.value.push(`Received: ${value}`)
        console.log('Received data:', value)
      })
    } catch (err) {
      logs.value.push(`Error: ${err.message || err}`)
      console.error(err)
    } finally {
      load.value = false
    }
  }

  if (terminalInput.value.trim().startsWith('service ')) {
    try {
      if (!server.value) throw '❌ Device not connected'

      const params = terminalInput.value.replace('service ', '').split(' ')
      logs.value.push('🛠️ Setting up service...')

      // Get Service
      const service = await server.value.getPrimaryService(params[0])
      logs.value.push('✅ Service found')

      // Get Characteristic for Writing
      const characteristic = await service.getCharacteristic(params[1])
      logs.value.push('✍️ Writing characteristic found')

      // Ensure it supports writing
      if (!characteristic.properties.write) {
        throw new Error('❌ Characteristic does not support writing!')
      }

      // Setup Response Notifications
      const responseCharacteristic = await service.getCharacteristic(
        '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
      )
      logs.value.push('📡 Setting up notifications')

      // Ensure notifications are supported
      if (
        !responseCharacteristic.properties.notify &&
        !responseCharacteristic.properties.indicate
      ) {
        throw new Error('❌ Characteristic does not support notifications!')
      }

      // Enable CCCD Descriptor (Manually Activate Notifications)
      const cccd = await responseCharacteristic.getDescriptor('2902')
      await cccd.writeValue(new Uint8Array([0x01, 0x00]))
      logs.value.push('✅ CCCD descriptor set')

      // Add Listener Before Enabling Notifications
      responseCharacteristic.addEventListener('characteristicvaluechanged', (ev) => {
        const value = new TextDecoder().decode(ev.target.value)
        console.log('📩 Received data:', value)
        logs.value.push(`📩 Received: ${value}`)
      })

      // Start Notifications
      await responseCharacteristic.startNotifications()
      logs.value.push('✅ Notifications enabled')

      // Send "showconfig" Command
      const encoder = new TextEncoder()
      logs.value.push('📤 Sending command: showconfig')

      try {
        await characteristic.writeValueWithResponse(encoder.encode('showconfig\n'))
      } catch {
        await characteristic.writeValue(encoder.encode('showconfig\n'))
      }

      logs.value.push('✅ Command sent: showconfig')
    } catch (err) {
      logs.value.push(`❌ Error: ${err.message || err}`)
      console.error(err)
    }
  }

  if (terminalInput.value.trim() == 'clear') {
    logs.value = []
  }

  if (terminalInput.value.trim() == 'showconfig') {
    // Send "showconfig" command immediately after connection
    const encoder = new TextEncoder()
    await characteristic.value.writeValue(encoder.encode('showconfig\n'))
    logs.value.push('Sent command: showconfig')

    // Enable notifications on response characteristic (if applicable)
    const responseCharacteristic = await service.getCharacteristic(
      '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
    )
    await responseCharacteristic.startNotifications()

    responseCharacteristic.addEventListener('characteristicvaluechanged', (ev) => {
      const value = new TextDecoder().decode(ev.target.value)
      logs.value.push(`Received: ${value}`)
      console.log('Received data:', value)
    })
  }

  terminalInput.value = ''
}
</script>

<template>
  <div class="flex items-center min-h-screen w-full bg-cover" style="background-image: url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp6843223.jpg&f=1&nofb=1&ipt=4290309946c1cc0d58357c5684c6a45e0f4d63d66bf9ff9052770913fd4393c4&ipo=images')">
    <div class="flex flex-col max-w-3xl w-full mx-auto rounded-xl overflow-hidden">
      <div class="w-full bg-[#39393B] py-2 px-3">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-red-500"></div>
          <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
          <div class="w-4 h-4 rounded-full bg-green-500"></div>
        </div>
      </div>
      <form
        @submit.prevent="handleSubmit"
        class="bg-[#2E333F] h-96 max-w-3xl w-full mx-auto font-semibold px-2 pt-2 pb-4 dark:text-white overflow-y-scroll scroll-hidden no-scrollbar"
      >
        <p v-for="(log, index) in logs" :key="index">{{ log }}</p>
        <p v-if="!load" class="flex items-center gap-2">
          <span>bledash~%</span>
          <input v-model="terminalInput" class="bg-transparent outline-none w-full" />
        </p>
      </form>
    </div>
  </div>
</template>

<style></style>
