import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando semillas de la base de datos...');

    // Crear usuario administrador por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@cafecolombia.com' },
        update: {},
        create: {
            email: 'admin@cafecolombia.com',
            password: hashedPassword,
            firstName: 'Administrador',
            lastName: 'Sistema',
            role: 'ADMINISTRADOR',
        },
    });

    console.log('✅ Usuario administrador creado:', adminUser.email);

    // Crear usuario trabajador de ejemplo
    const workerPassword = await bcrypt.hash('worker123', 10);

    const workerUser = await prisma.user.upsert({
        where: { email: 'trabajador@cafecolombia.com' },
        update: {},
        create: {
            email: 'trabajador@cafecolombia.com',
            password: workerPassword,
            firstName: 'Juan',
            lastName: 'Pérez',
            role: 'TRABAJADOR',
        },
    });

    console.log('✅ Usuario trabajador creado:', workerUser.email);

    // Crear insumos básicos
    const inputs = [
        {
            name: 'Urea',
            type: 'FERTILIZANTE',
            brand: 'Yara',
            activeIngredient: 'Nitrógeno',
            concentration: '46%',
            unit: 'kg',
            gracePeriodDays: 0,
        },
        {
            name: 'Triple 15',
            type: 'FERTILIZANTE',
            brand: 'Monómeros',
            activeIngredient: 'NPK',
            concentration: '15-15-15',
            unit: 'kg',
            gracePeriodDays: 0,
        },
        {
            name: 'Glifosato',
            type: 'HERBICIDA',
            brand: 'Bayer',
            activeIngredient: 'Glifosato',
            concentration: '48%',
            unit: 'L',
            gracePeriodDays: 21,
        },
        {
            name: 'Cobre',
            type: 'FUNGICIDA',
            brand: 'BASF',
            activeIngredient: 'Oxicloruro de cobre',
            concentration: '50%',
            unit: 'kg',
            gracePeriodDays: 14,
        },
        {
            name: 'Imidacloprid',
            type: 'PESTICIDA',
            brand: 'Bayer',
            activeIngredient: 'Imidacloprid',
            concentration: '35%',
            unit: 'L',
            gracePeriodDays: 30,
        },
        {
            name: 'Compost Orgánico',
            type: 'ABONO_ORGANICO',
            brand: 'Local',
            activeIngredient: 'Materia orgánica',
            concentration: '100%',
            unit: 'kg',
            gracePeriodDays: 0,
        },
    ];

    for (const input of inputs) {
        const existingInput = await prisma.input.findFirst({
            where: { name: input.name }
        });

        if (existingInput) {
            await prisma.input.update({
                where: { id: existingInput.id },
                data: input
            });
        } else {
            await prisma.input.create({
                data: input
            });
        }
    }

    console.log('✅ Insumos básicos creados');

    // Crear finca de ejemplo
    let exampleFarm = await prisma.farm.findFirst({
        where: { name: 'Finca El Paraíso', ownerId: adminUser.id }
    });

    const farmData = {
        name: 'Finca El Paraíso',
        location: 'Huila, Colombia',
        area: 5.5,
        altitude: 1650,
        coordinates: JSON.stringify({
            lat: 2.5358,
            lng: -75.8849,
            polygon: [
                { lat: 2.5358, lng: -75.8849 },
                { lat: 2.5368, lng: -75.8849 },
                { lat: 2.5368, lng: -75.8839 },
                { lat: 2.5358, lng: -75.8839 },
            ]
        }),
        description: 'Finca cafetera familiar con variedades Caturra y Colombia',
        ownerId: adminUser.id,
    };

    if (exampleFarm) {
        exampleFarm = await prisma.farm.update({
            where: { id: exampleFarm.id },
            data: farmData
        });
    } else {
        exampleFarm = await prisma.farm.create({
            data: farmData
        });
    }

    console.log('✅ Finca de ejemplo creada:', exampleFarm.name);

    // Crear lotes de ejemplo
    const lots = [
        {
            name: 'Lote Alto',
            farmId: exampleFarm.id,
            area: 2.0,
            variety: 'Caturra',
            plantingDate: new Date('2020-03-15'),
            coordinates: JSON.stringify({
                lat: 2.5360,
                lng: -75.8845,
                polygon: [
                    { lat: 2.5360, lng: -75.8845 },
                    { lat: 2.5365, lng: -75.8845 },
                    { lat: 2.5365, lng: -75.8840 },
                    { lat: 2.5360, lng: -75.8840 },
                ]
            }),
            soilType: 'Franco arcilloso',
            slope: 15.5,
        },
        {
            name: 'Lote Bajo',
            farmId: exampleFarm.id,
            area: 1.8,
            variety: 'Colombia',
            plantingDate: new Date('2019-11-20'),
            coordinates: JSON.stringify({
                lat: 2.5355,
                lng: -75.8850,
                polygon: [
                    { lat: 2.5355, lng: -75.8850 },
                    { lat: 2.5360, lng: -75.8850 },
                    { lat: 2.5360, lng: -75.8845 },
                    { lat: 2.5355, lng: -75.8845 },
                ]
            }),
            soilType: 'Franco limoso',
            slope: 8.2,
        },
    ];

    for (const lot of lots) {
        const existingLot = await prisma.lot.findFirst({
            where: { name: lot.name, farmId: exampleFarm.id }
        });

        if (existingLot) {
            await prisma.lot.update({
                where: { id: existingLot.id },
                data: lot
            });
        } else {
            await prisma.lot.create({
                data: lot
            });
        }
    }

    console.log('✅ Lotes de ejemplo creados');

    console.log('🎉 Semillas completadas exitosamente!');
}

main()
    .catch((e) => {
        console.error('❌ Error en las semillas:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
