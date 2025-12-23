import { query } from '../db';

async function clean() {
    try {
        console.log('🧹 Limpiando base de datos de pruebas...');

        // Primero eliminamos Reviews porque dependen de Rental
        await query('DELETE FROM "Review"');
        console.log('✅ Reseñas eliminadas.');

        // Luego eliminamos Rentals
        await query('DELETE FROM "Rental"');
        console.log('✅ Reservas eliminadas.');

        console.log('✨ Base de datos lista para nuevas pruebas (Usuarios e Items conservados).');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error limpiando DB:', e);
        process.exit(1);
    }
}

clean();
