import { query } from './index';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        console.log("🌱 Seeding database...");

        // Clear existing data
        await query('TRUNCATE "Review", "Rental", "Item", "User" RESTART IDENTITY CASCADE');

        const password = await bcrypt.hash('123456', 10);

        // Fixed UUIDs for relations
        const owners = {
            carlos: '11111111-1111-1111-1111-111111111111',
            pedro: '33333333-3333-3333-3333-333333333333',
            maria: '44444444-4444-4444-4444-444444444444',
        };
        const renters = {
            ana: '22222222-2222-2222-2222-222222222222',
            luis: '55555555-5555-5555-5555-555555555555'
        };

        const users = [
            { id: owners.carlos, name: 'Carlos Dueño', email: 'carlos@rentai.com', role: 'OWNER', avatar: 'https://picsum.photos/id/64/100/100' },
            { id: renters.ana, name: 'Ana Arrendataria', email: 'ana@gmail.com', role: 'RENTER', avatar: 'https://picsum.photos/id/65/100/100' },
            { id: owners.pedro, name: 'Pedro Owner', email: 'pedro@gmail.com', role: 'OWNER', avatar: 'https://picsum.photos/id/66/100/100' },
            { id: owners.maria, name: 'Maria Owner', email: 'maria@gmail.com', role: 'OWNER', avatar: 'https://picsum.photos/id/67/100/100' },
            { id: renters.luis, name: 'Luis Gamer', email: 'luis@gmail.com', role: 'RENTER', avatar: 'https://picsum.photos/id/68/100/100' }
        ];

        for (const u of users) {
            await query(
                `INSERT INTO "User" (id, name, email, password, role, "avatarUrl") VALUES ($1, $2, $3, $4, $5, $6)`,
                [u.id, u.name, u.email, password, u.role, u.avatar]
            );
        }
        console.log("✅ Users seeded");

        // Items with valid UUIDs
        const items = [
            {
                id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                title: 'Sony Alpha a7 III Mirrorless',
                description: 'Cámara profesional full-frame, ideal para video 4K y fotografía nocturna. Incluye lente 28-70mm.',
                category: 'Cámaras',
                price: 120,
                image: 'https://picsum.photos/id/250/800/600',
                ownerId: owners.carlos,
                location: 'El Tambo, Huancayo',
                lat: -12.0543, lng: -75.2150,
                available: true
            },
            {
                id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                title: 'DJI Mavic Air 2',
                description: 'Drone plegable con cámara 4K/60fps, fotos de 48MP y transmisión de video de 10km. Incluye 3 baterías.',
                category: 'Drones',
                price: 85,
                image: 'https://picsum.photos/id/1/800/600',
                ownerId: owners.pedro, // Pedro
                location: 'San Carlos, Huancayo',
                lat: -12.0620, lng: -75.2020,
                available: true
            },
            {
                id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                title: 'Nintendo Switch OLED',
                description: 'Consola híbrida con pantalla OLED de 7 pulgadas. Incluye Mario Kart 8 y Zelda BOTW.',
                category: 'Gaming',
                price: 40,
                image: 'https://picsum.photos/id/96/800/600',
                ownerId: owners.carlos,
                location: 'Chilca, Huancayo',
                lat: -12.0850, lng: -75.2100,
                available: false
            },
            {
                id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
                title: 'Carpa 4 Estaciones North Face',
                description: 'Carpa resistente para alta montaña. Capacidad 3 personas. Impermeable y ligera.',
                category: 'Camping',
                price: 55,
                image: 'https://picsum.photos/id/449/800/600',
                ownerId: owners.maria,
                location: 'Pilcomayo, Huancayo',
                lat: -12.0550, lng: -75.2350,
                available: true
            },
            {
                id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
                title: 'Proyector Epson Home Cinema',
                description: 'Full HD 1080p, 3000 lúmenes. Perfecto para cine en casa o presentaciones.',
                category: 'Audio',
                price: 60,
                image: 'https://picsum.photos/id/180/800/600',
                ownerId: owners.carlos,
                location: 'Centro, Huancayo',
                lat: -12.0681, lng: -75.2106,
                available: true
            }
        ];

        for (const i of items) {
            await query(
                `INSERT INTO "Item" (id, title, description, category, "pricePerDay", "imageUrl", location, latitude, longitude, available, "ownerId") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [i.id, i.title, i.description, i.category, i.price, i.image, i.location, i.lat, i.lng, i.available, i.ownerId]
            );
        }
        console.log("✅ Items seeded");

        console.log("🚀 Seed completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seed();
