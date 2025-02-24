const FEATURE_NAMES = [
    "promedio", "std",
    "APRO_N1", "PERD_N1",
    "APRO_N2", "PERD_N2",
    "APRO_N3", "PERD_N3",
    "APRO_N4", "PERD_N4",
    "APRO_N5", "PERD_N5",
    "APRO_N6", "PERD_N6",
    "APRO_N7", "PERD_N7",
    "APRO_N8", "PERD_N8"
];


function prepareFeatures(historial) {
    if (!Array.isArray(historial) || historial.length === 0) {
        console.error("❌ Error: historial no es un array válido o está vacío", historial);
        return null;
    }

    try {
        // Normalizar datos
        const historiaNormalizado = historial.map(item => {
            const promedio = parseFloat(item.promedio) || 0;
            const nivel = parseInt(item.nivel, 10) || 0;

            if (isNaN(promedio) || isNaN(nivel)) {
                console.error("❌ Error: promedio o nivel no es un número válido", item);
            }

            return { promedio, nivel };
        });

        // Calcular promedio y STD
        const promedio = historiaNormalizado.reduce((sum, item) => sum + item.promedio, 0) / historiaNormalizado.length;
        const std = Math.sqrt(
            historiaNormalizado.reduce((sum, item) => sum + Math.pow(item.promedio - promedio, 2), 0) /
            historiaNormalizado.length
        );

        if (isNaN(promedio) || isNaN(std)) {
            console.error("❌ Error: promedio o std es NaN", { promedio, std });
            return null;
        }

        // Inicializar contadores por nivel
        const contadores = {};
        for (let i = 1; i <= 8; i++) {
            contadores[`APRO_N${i}`] = 0;
            contadores[`PERD_N${i}`] = 0;
        }

        // Contar aprobados y reprobados por nivel
        historiaNormalizado.forEach(item => {
            const nivel = item.nivel;
            if (nivel >= 1 && nivel <= 8) {
                if (item.promedio >= 14.1) {
                    contadores[`APRO_N${nivel}`]++;
                } else {
                    contadores[`PERD_N${nivel}`]++;
                }
            }
        });

        // Crear array de features en el orden exacto que espera el modelo
        const features = [
            promedio,
            std,
            contadores.APRO_N1, contadores.PERD_N1,
            contadores.APRO_N2, contadores.PERD_N2,
            contadores.APRO_N3, contadores.PERD_N3,
            contadores.APRO_N4, contadores.PERD_N4,
            contadores.APRO_N5, contadores.PERD_N5,
            contadores.APRO_N6, contadores.PERD_N6,
            contadores.APRO_N7, contadores.PERD_N7,
            contadores.APRO_N8, contadores.PERD_N8
        ];

        // Validar que tenemos el número correcto de features
        if (features.length !== FEATURE_NAMES.length) {
            throw new Error(`Número incorrecto de features: ${features.length}, esperado: ${FEATURE_NAMES.length}`);
        }

        console.log("✅ Features generadas:", 
            Object.fromEntries(FEATURE_NAMES.map((name, i) => [name, features[i]])));
        return features;

    } catch (error) {
        console.error("❌ Error al preparar features:", error);
        return null;
    }
}
module.exports = prepareFeatures;