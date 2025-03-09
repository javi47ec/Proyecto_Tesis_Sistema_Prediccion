const request = require("supertest");
const app = require("../server"); // Asegúrate de importar `app`, no `server.listen()`

describe("Pruebas de integración - API de Estudiantes", () => {
  test("Debería obtener la lista básica de estudiantes", async () => {
    const response = await request(app).get("/api/estudiantes/basico"); // 👈 Ruta correcta
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Debería obtener los niveles educativos", async () => {
    const response = await request(app).get("/api/estudiantes/niveles"); // 👈 Ruta correcta
  
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // 👈 Verifica que sea un array
    expect(response.body.length).toBeGreaterThan(0); // 👈 Asegura que haya niveles
    expect(response.body[0]).toHaveProperty("nombre"); // 👈 Cada nivel debe tener un "nombre"
  });
  

  test("Debería obtener la lista de períodos académicos", async () => {
    const response = await request(app).get("/api/estudiantes/periodos"); // 👈 Ruta correcta
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // 👈 Verifica que sea un array
    expect(response.body.length).toBeGreaterThan(0); // 👈 Asegura que no esté vacío
  });
  
});
