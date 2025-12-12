export interface ScaleData {
    weight: number;
    unit: 'kg' | 'lbs';
    stable: boolean;
}

export class BluetoothScaleService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

    // Standard Weight Scale Service UUIDs
    // 0x181D is the standard Weight Scale Service
    private static readonly WEIGHT_SERVICE_UUID = 0x181D;
    // 0x2A9D is the standard Weight Measurement Characteristic
    private static readonly WEIGHT_CHARACTERISTIC_UUID = 0x2A9D;

    constructor() { }

    isSupported(): boolean {
        return 'bluetooth' in navigator;
    }

    async connect(onWeightChange: (data: ScaleData) => void, onError: (error: string) => void): Promise<boolean> {
        if (!this.isSupported()) {
            onError('Web Bluetooth no está soportado en este navegador. Use Chrome, Edge o Opera.');
            return false;
        }

        try {
            console.log('Requesting Bluetooth Device...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [BluetoothScaleService.WEIGHT_SERVICE_UUID] }
                ],
                // Optional: accept all devices if standard service is missing in filter, 
                // but strictly filtering is better for UX.
                // acceptAllDevices: true, 
                optionalServices: [BluetoothScaleService.WEIGHT_SERVICE_UUID]
            });

            if (!this.device) {
                throw new Error('No se seleccionó ningún dispositivo.');
            }

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

            console.log('Connecting to GATT Server...');
            this.server = await this.device.gatt?.connect() || null;

            if (!this.server) {
                throw new Error('No se pudo conectar al servidor GATT.');
            }

            console.log('Getting Service...');
            const service = await this.server.getPrimaryService(BluetoothScaleService.WEIGHT_SERVICE_UUID);

            console.log('Getting Characteristic...');
            this.characteristic = await service.getCharacteristic(BluetoothScaleService.WEIGHT_CHARACTERISTIC_UUID);

            // Start Notifications
            await this.characteristic.startNotifications();
            this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
                if (value) {
                    const parsedData = this.parseWeight(value);
                    onWeightChange(parsedData);
                }
            });

            console.log('Scale connected and listening...');
            return true;

        } catch (error: any) {
            console.error('Bluetooth error:', error);
            onError(error.message || 'Error de conexión Bluetooth');
            if (this.device && this.device.gatt?.connected) {
                this.device.gatt.disconnect();
            }
            return false;
        }
    }

    disconnect() {
        if (this.device && this.device.gatt?.connected) {
            this.device.gatt.disconnect();
        }
        this.device = null;
        this.server = null;
        this.characteristic = null;
    }

    private onDisconnected(event: Event) {
        console.log('Device disconnected');
        // Retrieve device from event if needed, or trigger global state cleanup
    }

    /**
     * Parse GATT Weight Measurement Data (0x2A9D)
     * Format depends on flags in the first byte.
     * Byte 0: Flags
     *  - Bit 0: Measurement Units (0=SI/kg, 1=Imperial/lbs)
     *  - Bit 1: Time Stamp present
     *  - Bit 2: User ID present
     *  - Bit 3: BMI and Height present
     */
    private parseWeight(data: DataView): ScaleData {
        const flags = data.getUint8(0);
        const isImperial = (flags & 0x01) !== 0;

        // Weight is usually at offset 1, uint16 resolution 0.005 for SI, 0.01 for Imperial
        // HOWEVER, standard spec says:
        // "Mandatory: uint16 weight, resolution according to units" 
        // Real implementation might vary slightly per manufacturer, but let's stick to standard first.

        let weight = data.getUint16(1, true); // Little Endian

        // Resolution factors (common standards)
        // If KG: resolution 0.005kg
        // If LBS: resolution 0.01lb
        let finalWeight: number;

        if (isImperial) {
            finalWeight = weight * 0.01;
        } else {
            // Standard resolution for kg is often 0.005, but could be 0.01 depending on specific device implementation profile
            // For many generic scales it's just raw / 100 or raw / 200.
            // Let's assume resolution 0.01 for simplicity if 0.005 yields weird numbers, 
            // but standard says 0.005. Let's try to detect or assume standard 2 decimal places.
            finalWeight = weight * 0.005;
        }

        // Sometimes manufacturers use proprietary formats. 
        // If the number seems way off (e.g. 0.00), it might require adjusting the resolution or offset.

        return {
            weight: parseFloat(finalWeight.toFixed(2)),
            unit: isImperial ? 'lbs' : 'kg',
            stable: true // Standard charactersitic usually implies a measured "stable" value
        };
    }
}

export const bluetoothScaleService = new BluetoothScaleService();
