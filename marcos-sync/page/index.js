import { createWidget, widget, align, showToast, prop } from '@zos/ui'
import { Step, Sleep, Calorie } from '@zos/sensor'
import { requestPermission } from '@zos/app'
import { BasePage } from '@zeppos/zml/base-page'

Page(BasePage({
    build() {
        // 1. Fondo
        createWidget(widget.FILL_RECT, {
            x: 0, y: 0, w: 480, h: 480, color: 0x000000
        })

        // 2. Título principal
        const mainTitle = createWidget(widget.TEXT, {
            x: 0, y: 15, w: 480, h: 40, color: 0x00FF99,
            text_size: 28, align_h: align.CENTER_H,
            text: 'MARCOS V5'
        })

        // 3. UI de Datos
        createWidget(widget.TEXT, {
            x: 0, y: 60, w: 480, h: 30, color: 0xAAAAAA,
            text_size: 18, align_h: align.CENTER_H,
            text: 'SUEÑO (ÚLTIMO REGISTRO)'
        })

        const sleepDisplay = createWidget(widget.TEXT, {
            x: 0, y: 90, w: 480, h: 60, color: 0x7A5CFF,
            text_size: 60, align_h: align.CENTER_H,
            text: '0'
        })

        const stepsDisplay = createWidget(widget.TEXT, {
            x: 0, y: 150, w: 480, h: 40, color: 0xFFFFFF,
            text_size: 30, align_h: align.CENTER_H,
            text: '0 pasos'
        })

        const caloriesDisplay = createWidget(widget.TEXT, {
            x: 0, y: 190, w: 480, h: 40, color: 0xFF8800,
            text_size: 30, align_h: align.CENTER_H,
            text: '0 kcal'
        })

        // 4. Lógica de Sensores
        let stepInstance = null
        let sleepInstance = null
        let calorieInstance = null

        function refreshUI() {
            // Pasos
            try {
                if (!stepInstance) stepInstance = new Step()
                const steps = stepInstance.getCurrent()
                stepsDisplay.setProperty(prop.TEXT, `${steps === undefined ? '?' : steps} pasos`)
            } catch (err) {
                console.log('Error steps:', err)
                stepsDisplay.setProperty(prop.TEXT, `Err pasos`)
            }

            // Calorías
            try {
                if (!calorieInstance) calorieInstance = new Calorie()
                const cal = calorieInstance.getCurrent()
                caloriesDisplay.setProperty(prop.TEXT, `${cal === undefined ? '?' : cal} kcal`)
            } catch (err) {
                console.log('Error calories:', err)
                caloriesDisplay.setProperty(prop.TEXT, `Err kcal`)
            }

            // Sueño
            try {
                if (!sleepInstance) sleepInstance = new Sleep()
                sleepInstance.updateInfo()
                const info = sleepInstance.getInfo()
                const score = info && info.score !== undefined ? info.score : '?'
                sleepDisplay.setProperty(prop.TEXT, `${score}`)
            } catch (err) {
                console.log('Error sleep:', err)
                sleepDisplay.setProperty(prop.TEXT, `Err`)
            }
        }

        // Ejecutar carga inicial y pedir permisos
        try {
            const requiredPermissions = [
                'data:user.hd.step',
                'data:user.hd.calorie',
                'data:user.hd.sleep'
            ]
            requestPermission({
                permissions: requiredPermissions,
                callback: (result) => {
                    console.log('Permisos concedidos:', result)
                    refreshUI()
                    // Suscribirse a cambios de pasos
                    if (stepInstance) {
                        stepInstance.onChange(() => {
                            const s = stepInstance.getCurrent() || 0
                            stepsDisplay.setProperty(prop.TEXT, `${s} pasos`)
                        })
                    }
                }
            })
            // Llamamos refresh por si ya los tenía
            refreshUI()
        } catch (e) {
            mainTitle.setProperty(prop.TEXT, 'ERR PERMISOS')
        }

        // 5. Botón de Sincronización
        createWidget(widget.BUTTON, {
            x: 60, y: 240, w: 360, h: 60, radius: 30,
            normal_color: 0x00FF99, press_color: 0x00CC77,
            text_size: 26, color: 0x000000,
            text: 'SINCRONIZAR',
            click_func: () => {
                showToast({ text: 'Sincronizando...' })
                refreshUI() // Asegurar datos frescos antes de enviar

                const finalSteps = stepInstance ? (stepInstance.getCurrent() || 0) : 0
                let finalSleep = 0
                if (sleepInstance) {
                    try {
                        const info = sleepInstance.getInfo()
                        finalSleep = info && info.score !== undefined ? info.score : 0
                    } catch (e) { }
                }
                const finalCalories = calorieInstance ? (calorieInstance.getCurrent() || 0) : 0

                this.request({
                    method: 'sync_data',
                    params: { steps: finalSteps, sleepScore: finalSleep, calories: finalCalories }
                })
                    .then(() => {
                        showToast({ text: '¡ENVIADO AL SISTEMA!' })
                    })
                    .catch(err => {
                        showToast({ text: 'SIN RED/CONEXIÓN' })
                    })
            }
        })
    }
}))
