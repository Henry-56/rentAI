import { query } from '../db';

async function wipeAll() {
    try {
        console.log('⚠️ INICIANDO LIMPIEZA TOTAL DE BASE DE DATOS...');

        // 1. Delete Reviews (FK to Rental, Item, User)
        await query('DELETE FROM "Review"');
        console.log('✅ Reseñas eliminadas.');

        // 2. Delete Rentals (FK to Item, User)
        await query('DELETE FROM "Rental"');
        console.log('✅ Reservas eliminadas.');

        // 3. Delete Items (FK to User)
        await query('DELETE FROM "Item"');
        console.log('✅ Publicaciones eliminadas.');

        // 4. Delete Users
        await query('DELETE FROM "User"');
        console.log('✅ Usuarios eliminados.');

        console.log('✨ Base de datos completamente vacía.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error limpiando DB:', e);
        process.exit(1);
    }
}

wipeAll();
