import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService"; // Asegúrate de importar el servicio

const ResetPasswordPage = () => {
  const { token } = useParams(); // Captura el token de la URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess("✅ Contraseña cambiada correctamente. Redirigiendo...");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">Restablecer Contraseña</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Ingrese su nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Cambiando contraseña..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
