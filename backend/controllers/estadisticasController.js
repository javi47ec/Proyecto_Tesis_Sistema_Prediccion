const pool = require('../config/db');

const getDatosGenerales = async (req, res) => {
    const { nivel } = req.query;

    try {
        let queryStr = `
            SELECT 
                COALESCE(ROUND(AVG(ha.promedio), 2), 0) AS promedioGeneral,
                COALESCE(SUM(DISTINCT a.creditos), 0) AS creditosCursados,  -- 🔥 Filtrar correctamente
                COUNT(DISTINCT a.codigo_asignatura) AS asignaturas,
                n.nombre AS nivel
            FROM historial_academico ha
            JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
            JOIN nivel n ON a.nivel_id = n.nivel_id
            WHERE 1=1`;  // 🔍 Se asegura de que la consulta siempre tiene una condición base

        const params = [];

        if (nivel && nivel !== 'todos') {
            queryStr += ` AND TRIM(LOWER(n.nombre)) = TRIM(LOWER(?))`;  
            params.push(nivel);
        }

        queryStr += ` GROUP BY n.nombre`;

        console.log("🔍 SQL Ejecutada:", queryStr);
        console.log("📌 Parámetros:", params);

        const [result] = await pool.query(queryStr, params);

        res.json(result.length > 0 ? result[0] : {
            promedioGeneral: 0,
            creditosCursados: 0,
            asignaturas: 0,
            nivel: nivel || 'TODOS'
        });
    } catch (error) {
        console.error("❌ Error en getDatosGenerales:", error);
        res.status(500).json({ error: 'Error al obtener datos generales' });
    }
};



const getDatosRendimiento = async (req, res) => {
    const { nivel, recientes } = req.query;
    try {
        let whereClause = "WHERE 1=1";
        const params = [];

        if (nivel && nivel !== 'todos') {
            whereClause += ` AND n.nombre = ?`;
            params.push(nivel);
        }

        if (recientes === "true") {
            whereClause += ` AND ha.fecha_registro >= NOW() - INTERVAL 7 DAY`;
        }

        const query = `
            SELECT parcial, 
                   ROUND(AVG(promedio), 2) as promedio,
                   MIN(minimo) as minimo,
                   MAX(maximo) as maximo
            FROM (
                SELECT '1P' AS parcial, nota_1p as promedio, nota_1p as minimo, nota_1p as maximo
                FROM historial_academico ha
                JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
                JOIN nivel n ON a.nivel_id = n.nivel_id
                ${whereClause}
                UNION ALL
                SELECT '2P', nota_2p, nota_2p, nota_2p
                FROM historial_academico ha
                JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
                JOIN nivel n ON a.nivel_id = n.nivel_id
                ${whereClause}
                UNION ALL
                SELECT '3P', nota_3p, nota_3p, nota_3p
                FROM historial_academico ha
                JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
                JOIN nivel n ON a.nivel_id = n.nivel_id
                ${whereClause}
            ) as notas
            GROUP BY parcial`;

        const [rows] = await pool.query(query, params.length ? [...params, ...params, ...params] : []);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error en getDatosRendimiento:", error);
        res.status(500).json({ error: 'Error al obtener datos de rendimiento' });
    }
};


const getDistribucionNotas = async (req, res) => {
    const { nivel } = req.query;
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (nivel && nivel !== 'todos') {
            whereClause += ` AND n.nombre = ?`;
            params.push(nivel);
        }

        const query = `
            SELECT 
                CASE 
                    WHEN promedio BETWEEN 10 AND 12 THEN '10-12'
                    WHEN promedio > 12 AND promedio <= 14 THEN '12-14'
                    WHEN promedio > 14 AND promedio <= 16 THEN '14-16'
                    WHEN promedio > 16 AND promedio <= 18 THEN '16-18'
                    WHEN promedio > 18 AND promedio <= 20 THEN '18-20'
                END AS rango,
                COUNT(*) AS cantidad
            FROM historial_academico ha
            JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
            JOIN nivel n ON a.nivel_id = n.nivel_id
            ${whereClause}
            GROUP BY rango
            ORDER BY rango`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error al obtener distribución de notas' });
    }
};

const getRendimientoAsignaturas = async (req, res) => {
    const { nivel } = req.query;
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (nivel && nivel !== 'todos') {
            whereClause += ' AND n.nombre = ?';
            params.push(nivel);
        }

        const query = `
            SELECT 
                a.nombre AS asignatura, 
                ROUND(AVG(ha.promedio), 2) AS promedio,
                n.nombre AS nivel  -- 🔥 Aseguramos que el nivel se devuelva en la API
            FROM asignatura a
            JOIN nivel n ON a.nivel_id = n.nivel_id
            LEFT JOIN historial_academico ha ON a.codigo_asignatura = ha.codigo_asignatura
            ${whereClause}
            GROUP BY a.codigo_asignatura, a.nombre, n.nombre  -- 🔥 Agregamos n.nombre en el GROUP BY
            HAVING promedio IS NOT NULL  
            ORDER BY promedio DESC`;

        console.log("🔍 SQL Query Ejecutada:", query);
        console.log("📌 Parámetros:", params);

        const [rows] = await pool.query(query, params);
        res.json(rows.length > 0 ? rows : []);  // ✅ Si no hay datos, devolver array vacío
    } catch (error) {
        console.error("❌ Error en getRendimientoAsignaturas:", error);
        res.status(500).json({ error: 'Error al obtener rendimiento por asignaturas' });
    }
};



const getCantidadEstudiantesPorNivel = async (req, res) => {
    try {
        const query = `
            SELECT n.nombre AS nivel, COUNT(DISTINCT ha.id_estudiante) AS cantidadEstudiantes
            FROM historial_academico ha
            JOIN asignatura a ON ha.codigo_asignatura = a.codigo_asignatura
            JOIN nivel n ON a.nivel_id = n.nivel_id
            GROUP BY n.nombre;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error en getCantidadEstudiantesPorNivel:", error);
        res.status(500).json({ error: 'Error al obtener la cantidad de estudiantes por nivel' });
    }
};



module.exports = {
    getDatosGenerales,
    getDatosRendimiento,
    getDistribucionNotas,
    getRendimientoAsignaturas,
    getCantidadEstudiantesPorNivel
};